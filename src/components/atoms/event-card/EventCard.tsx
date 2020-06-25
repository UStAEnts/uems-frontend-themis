import * as React from 'react';
import {
    faBolt,
    faClock,
    faExclamationCircle,
    faQuestionCircle,
    faTag,
    faTicketAlt,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './EventCard.scss';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Event, EventState } from '../../../types/Event';

export type EventCardPropsType = {
    /**
     * The event that this card should render
     */
    event: Event,
    /**
     * If this is a collapsed box (less direct detail, smaller profile)
     */
    collapsed: boolean,
}

export type EventCardStateType = {};

export class EventCard extends React.Component<EventCardPropsType, EventCardStateType> {

    static iconColor = '#b7b7b7';

    static defaultProps = {
        collapsed: false,
    }

    /**
     * Returns the time difference between the booking start and end and returns it as a `x hours` or
     * `x hours, x minutes` value.
     */
    private getTimeDifference() {
        const duration = moment.duration(moment(this.props.event.bookingEnd).diff(this.props.event.bookingStart));
        const hours = duration.asHours();
        const minutes = duration.asMinutes() - (hours * 60);

        if (minutes === 0) return `${hours} hours`;

        return `${hours} hours, ${minutes} minutes`;

    }

    /**
     * Returns either an undefined component or an exclamation circle if the duration of the event is over 6 hours.
     */
    private getDurationIcon() {
        const hours = Math.abs(this.props.event.bookingEnd.getTime() - this.props.event.bookingStart.getTime()) / 36e5;
        if (hours > 6) {

            return <FontAwesomeIcon icon={faExclamationCircle} className="warn" size="xs" />;

        }
        return undefined;

    }

    /**
     * Returns a status icon for the state of the event either a question circle if the state is undefined or does not
     * provide an icon value, or the icon provided in the props otherwise.
     * @param status the status to render
     */
    private static getStateIcon(status?: EventState) {
        if (status === undefined) {
            return <FontAwesomeIcon icon={faQuestionCircle} size="xs" />;
        }

        if (status.icon !== undefined && status.icon !== null) {
            return <FontAwesomeIcon icon={status.icon} size="xs" />;
        }

        return <FontAwesomeIcon icon={faQuestionCircle} size="xs" />;

    }

    /**
     * Returns an ents state based on the value in the event, either 'unknown' by default or the value held in the event
     */
    private getEntsState() {
        let status = <div className="ents-state unknown">Unknown</div>;

        if (this.props.event.entsStatus !== undefined) {
            if (this.props.event.entsStatus.color !== undefined) {
                status = (
                    <div
                        className="ents-state unknown"
                        style={{ backgroundColor: this.props.event.entsStatus.color }}
                    >
                        {this.props.event.entsStatus.name}
                    </div>
                );
            } else {
                status = (
                    <div
                        className={`ents-state ${this.props.event.entsStatus.name}`}
                    >
                        {this.props.event.entsStatus.name}
                    </div>
                );
            }
        }
        return (
            <div className="info">
                <div className="header">Ents State</div>
                {status}
            </div>
        );

    }

    /**
     * Generates the linear-gradient value used to render the two-tone bottom bar in the collapsed version of the event
     * card. It will use the event state and ents status to determine the two colours and place them side by side via
     * gradient.
     */
    private generateBorderColorCSS() {
        const stateColor = this.props.event.state === undefined || this.props.event.state.color === undefined
            ? '#B1B9B8'
            : this.props.event.state.color;
        const entsColor = this.props.event.entsStatus === undefined || this.props.event.entsStatus.color === undefined
            ? '#B1B9B8'
            : this.props.event.entsStatus.color;

        return `linear-gradient(to right, ${stateColor} 0%, ${stateColor} 50%, ${entsColor} 50%, ${entsColor} 100%)`;

    }

    /**
     * Renders the icon for the event either using the icon in the event if one is provided or just the ticketAlt icon
     * if not.
     */
    private renderEventIcon() {
        if (this.props.event.icon === undefined) {
            return <FontAwesomeIcon icon={faTicketAlt} color={EventCard.iconColor} size="lg" />;
        }

        return <FontAwesomeIcon icon={this.props.event.icon} color={EventCard.iconColor} size="lg" />;
    }

    private renderCollapsed() {
        return (
            <div className="event-card collapsed">
                <div className="upper">
                    <div className="top-bar collapsed">
                        {this.renderEventIcon()}
                        <div className="names">
                            <div className="name">{this.props.event.name}</div>
                            <div className="venue">{this.props.event.venue}</div>
                        </div>
                    </div>
                    <div className="bottom-bar collapsed">
                        <div className="horizontal">
                            <FontAwesomeIcon icon={faUsers} color={EventCard.iconColor} />
                            <div className="attendance">{this.props.event.attendance}</div>
                        </div>
                    </div>
                </div>
                <div className="lower" style={{ borderColor: this.props.event.color }}>
                    <div className="lower-content collapsed">
                        <div className="entry">
                            <FontAwesomeIcon icon={faClock} color="#797979" size="lg" />
                            <div className="info">
                                <div className="header">Duration</div>
                                <div className="duration">
                                    {this.getDurationIcon()}
                                    {this.getTimeDifference()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    data-tip
                    data-for={`cb-${Buffer.from(this.props.event.name).toString('base64')}`}
                    className="color-bar"
                    style={{ background: this.generateBorderColorCSS() }}
                />
                <ReactTooltip
                    place="top"
                    type="dark"
                    effect="float"
                    id={`cb-${Buffer.from(this.props.event.name).toString('base64')}`}
                >
                    <strong>State: </strong>
                    <span>{this.props.event.state === undefined ? 'Unknown' : this.props.event.state.state}</span>
                    <br />
                    <strong>Ents: </strong>
                    <span>
                        {this.props.event.entsStatus === undefined
                            ? 'Unknown'
                            : this.props.event.entsStatus.name}
                    </span>
                </ReactTooltip>
            </div>
        );

    }

    private renderExpanded() {
        return (
            <div className="event-card">
                <div className="upper">
                    <div className="top-bar">
                        {this.renderEventIcon()}
                        <div className="names">
                            <div className="name">{this.props.event.name}</div>
                            <div className="venue">{this.props.event.venue}</div>
                        </div>
                    </div>
                    <div className="bottom-bar row">
                        <div className="col-xs-6 horizontal">
                            <FontAwesomeIcon icon={faUsers} color={EventCard.iconColor} />
                            <div className="attendance">{this.props.event.attendance}</div>
                        </div>
                        <div className="col-xs-6 horizontal">
                            <FontAwesomeIcon icon={faClock} color={EventCard.iconColor} />
                            <div className="time">{this.props.event.bookingStart.toDateString()}</div>
                        </div>
                    </div>
                </div>
                <div className="lower" style={{ borderColor: this.props.event.color }}>
                    <div className="row lower-content">
                        <div className="entry col-xs-4">
                            <FontAwesomeIcon icon={faClock} color="#797979" size="lg" />
                            <div className="info">
                                <div className="header">Duration</div>
                                <div className="duration">
                                    {this.getDurationIcon()}
                                    {this.getTimeDifference()}
                                </div>
                            </div>
                        </div>
                        <div className="entry col-xs-4">
                            <FontAwesomeIcon icon={faTag} color="#797979" size="lg" />
                            <div className="info">
                                <div className="header">State</div>
                                <div className="state">
                                    {EventCard.getStateIcon(this.props.event.state)}
                                    {this.props.event.state === undefined ? 'unknown' : this.props.event.state.state}
                                </div>
                            </div>
                        </div>
                        <div className="entry col-xs-4">
                            <FontAwesomeIcon icon={faBolt} color="#797979" size="lg" />
                            {this.getEntsState()}
                        </div>
                    </div>
                </div>
            </div>
        );

    }

    render() {
        return (
            <Link className="event-card" to="#">
                {this.props.collapsed ? this.renderCollapsed() : this.renderExpanded()}
            </Link>
        );

    }

}
