/* eslint-disable */
import React from 'react';
import ReactTimeAgo from "react-time-ago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Theme } from "../../../theme/Theme";
import { DateFilterStatus, Filter, NumberFilterStatus, SearchFilterStatus, SelectFilterStatus } from "../filter/Filter";

import './EventTable.scss';
import moment from "moment";
import { LinkedTD } from "../../atoms/LinkedTD";
import { Redirect } from "react-router";
import { EntsStateResponse, EventResponse, StateResponse } from "../../../utilities/APITypes";
import { IconName } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from "../../../utilities/ColorUtilities";

export type EventTablePropsType = {
    /**
     * The list of events to display in this table
     */
    events: EventResponse[],
}

export type EventTableStateType = {
    /**
     * A set of filters to apply to the table
     */
    filters: { [key: string]: DateFilterStatus | NumberFilterStatus | SelectFilterStatus | SearchFilterStatus },
    /**
     * If set the {@link Redirect} element will be rendered which will force the page to redirect to the path set here.
     * This makes it easy to trigger a redirect without having to be in the render function
     */
    forcedRedirect?: string,
};

export class EventTable extends React.Component<EventTablePropsType, EventTableStateType> {

    static displayName = 'EventTable';

    constructor(props: Readonly<EventTablePropsType>) {
        super(props);

        this.state = {
            filters: {},
        };

        this.makeEntsStatus = this.makeEntsStatus.bind(this);
        this.makeEventState = this.makeEventState.bind(this);
        this.eventToRow = this.eventToRow.bind(this);
        this.filter = this.filter.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    /**
     * Returns an ents state based on the value in the event, either 'unknown' by default or the value held in the event
     */
    private makeEntsStatus(entsStatus: undefined | EntsStateResponse) {
        let status = <div className="ents-state unknown">Unknown</div>;

        if (entsStatus !== undefined) {
            if (entsStatus.color !== undefined) {
                status = (
                    <div
                        className="ents-state unknown"
                        style={{ backgroundColor: entsStatus.color, color: ColorUtilities.determineForegroundColor(entsStatus.color) }}
                    >
                        {entsStatus.name}
                    </div>
                );
            } else {
                status = (
                    <div
                        className={`ents-state ${entsStatus.name}`}
                    >
                        {entsStatus.name}
                    </div>
                );
            }
        }

        return (
            status
        );
    }

    /**
     * Returns an ents state based on the value in the event, either 'unknown' by default or the value held in the event
     */
    private makeEventState(entsStatus: undefined | StateResponse) {
        let status = <div className="ents-state unknown">Unknown</div>;

        if (entsStatus !== undefined) {
            if (entsStatus.color !== undefined) {
                status = (
                    <div
                        className="ents-state unknown"
                        style={{ backgroundColor: entsStatus.color }}
                    >
                        {entsStatus.icon
                            ? <FontAwesomeIcon icon={entsStatus.icon as IconName} />
                            : undefined}
                        {entsStatus.name}
                    </div>
                );
            } else {
                status = (
                    <div
                        style={{
                            backgroundColor: Theme.GRAY_LIGHT,
                        }}
                        className={`ents-state ${entsStatus.name}`}
                    >
                        {entsStatus.icon
                            ? <FontAwesomeIcon icon={entsStatus.icon as IconName} />
                            : undefined}
                        {entsStatus.name}
                    </div>
                );
            }
        }

        return (
            status
        );
    }

    /**
     * Converts an event to a row in the table. This returns a TR element which redirects to the event page. Each
     * box in the table is rendered with {@link LinkedTD} which will allow it to be supported by screen readers.
     * @param event the event to render.
     */
    private eventToRow(event: EventResponse) {
        console.log(event);
        return (
            <tr
                key={event.id}
                data-testid={`et-row-${event.id}`}
                // @ts-ignore
                onClick={() => this.redirect(`/events/${event._id}`)}
            >
                <LinkedTD to={`/events/${event.id}`}>
                    {/* TODO: Icons do not current exist on events */}
                    {/*{event.icon*/}
                    {/*    ? <FontAwesomeIcon icon={event.icon} />*/}
                    {/*    : undefined}*/}
                </LinkedTD>

                <LinkedTD to={`/events/${event.id}`}>{event.name}</LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>{event.venue?.name}</LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    {moment.unix(event.startDate).format(' dddd Do MMMM (YYYY), HH:mm ')}
                    &#8594;
                    {moment.unix(event.endDate).format(' dddd Do MMMM (YYYY), HH:mm ')}
                </LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    <ReactTimeAgo date={event.startDate} />
                </LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    {this.makeEntsStatus(event.ents)}
                </LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    {this.makeEventState(event.state)}
                </LinkedTD>
            </tr>
        );
    }

    /**
     * Updates the state to set the forced redirect value
     * @param to the url to which we should redirect
     */
    private redirect(to: string){
        this.setState((oldState) => ({
            ...oldState,
            forcedRedirect: to,
        }));
    }

    /**
     * Runs the set of filters against this event and returns whether it matches. This will verify names, dates, states,
     * ents states and venues. If it returns false it means the event does not match the filters.
     * @param event the event to test
     */
    private filter(event: EventResponse) {
        if ('name' in this.state.filters) {
            const filter = this.state.filters.name as SearchFilterStatus;

            if (!event.name.toLowerCase().includes(filter.content.toLowerCase())) return false;
        }

        if ('date' in this.state.filters) {
            const filter = this.state.filters.date as DateFilterStatus;

            if (filter.startDate !== null) {
                if (filter.startDate.isAfter(moment.unix(event.startDate))) return false;
            }

            if (filter.endDate !== null) {
                if (filter.endDate.isBefore(moment.unix(event.endDate))) return false;
            }
        }

        if ('state' in this.state.filters) {
            const filter = this.state.filters.state as SelectFilterStatus;

            if (filter.selectedOption !== 'any') {
                if (event.state === undefined) return false;
                if (event.state.name !== filter.selectedOption) return false;
            }
        }

        if ('ents' in this.state.filters) {
            const filter = this.state.filters.ents as SelectFilterStatus;

            if (filter.selectedOption !== 'any') {
                if (event.ents === undefined) return false;
                if (event.ents.name !== filter.selectedOption) return false;
            }
        }

        if ('venues' in this.state.filters) {
            const filter = this.state.filters.venues as SelectFilterStatus;

            if (filter.selectedOption !== 'any') {
                if (typeof (filter.selectedOption) === 'string') {
                    if (event.venue.toLowerCase() !== filter.selectedOption.toLowerCase()) return false;
                } else {
                    if (event.venue.toLowerCase() !== filter.selectedOption.value.toLowerCase()) return false;
                }
            }
        }

        return true;
    }

    /**
     * Renders the table with filters for name, date, state, ents and venues.
     */
    render() {
        const states = this.props.events.map((e) => e.state === undefined ? undefined : e.state.name).filter((e) => e !== undefined).filter((value, index, self) => self.indexOf(value) === index) as string[];
        const ents = this.props.events.map((e) => e.ents === undefined ? undefined : e.ents.name).filter((e) => e !== undefined).filter((value, index, self) => self.indexOf(value) === index) as string[];
        const venues = this.props.events.map((e) => e.venue).filter((value, index, self) => self.indexOf(value) === index) as string[];

        [states, ents, venues].forEach(a => a.push('any'));

        return (
            <div className="events-table">
                {this.state.forcedRedirect
                    ? <Redirect to={this.state.forcedRedirect} />
                    : undefined}
                <Filter
                    filters={{
                        'name': {
                            name: 'Event Name',
                            type: 'search',
                        },
                        'date': {
                            name: 'Event Date',
                            type: 'date',
                        },
                        'state': {
                            name: 'Event State',
                            type: 'option',
                            options: states,
                        },
                        'ents': {
                            name: 'Ents Status',
                            type: 'option',
                            options: ents,
                        },
                        'venues': {
                            name: 'Venue',
                            type: 'option',
                            options: venues,
                        }
                    }}
                    onFilterChange={
                        (filters) => {
                            console.log('STATE CHANGE');
                            this.setState({
                                filters,
                            })
                        }
                    }
                />
                <table>
                    <thead>
                    <tr>
                        <th className="icon-column" />
                        <th className="name-column">Name</th>
                        <th className="venue-column">Venue</th>
                        <th className="time-column">Time</th>
                        <th className="status-column">Until</th>
                        <th className="status-column">Ents</th>
                        <th className="status-column">Building</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.events.filter(this.filter).map(this.eventToRow)}
                    </tbody>
                </table>
            </div>
        );
    }

}
