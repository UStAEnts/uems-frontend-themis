/* eslint-disable */
import React from 'react';
import { EntsStatus, Event, EventState } from '../../../types/Event';
import ReactTimeAgo from "react-time-ago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Theme } from "../../../theme/Theme";
import { DateFilterStatus, Filter, NumberFilterStatus, SearchFilterStatus, SelectFilterStatus } from "../filter/Filter";

import './EventTable.scss';
import moment from "moment";
import { LinkedTD } from "../../atoms/LinkedTD";
import { Redirect } from "react-router";

export type EventTablePropsType = {
    events: Event[],
}

export type EventTableStateType = {
    filters: { [key: string]: DateFilterStatus | NumberFilterStatus | SelectFilterStatus | SearchFilterStatus },
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
    private makeEntsStatus(entsStatus: undefined | EntsStatus) {
        let status = <div className="ents-state unknown">Unknown</div>;

        if (entsStatus !== undefined) {
            if (entsStatus.color !== undefined) {
                status = (
                    <div
                        className="ents-state unknown"
                        style={{ backgroundColor: entsStatus.color }}
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
    private makeEventState(entsStatus: undefined | EventState) {
        let status = <div className="ents-state unknown">Unknown</div>;

        if (entsStatus !== undefined) {
            if (entsStatus.color !== undefined) {
                status = (
                    <div
                        className="ents-state unknown"
                        style={{ backgroundColor: entsStatus.color }}
                    >
                        {entsStatus.icon
                            ? <FontAwesomeIcon icon={entsStatus.icon} />
                            : undefined}
                        {entsStatus.state}
                    </div>
                );
            } else {
                status = (
                    <div
                        style={{
                            backgroundColor: Theme.GRAY_LIGHT,
                        }}
                        className={`ents-state ${entsStatus.state}`}
                    >
                        {entsStatus.icon
                            ? <FontAwesomeIcon icon={entsStatus.icon} />
                            : undefined}
                        {entsStatus.state}
                    </div>
                );
            }
        }

        return (
            status
        );
    }

    private eventToRow(event: Event) {
        return (
            <tr
                key={event._id}
                // @ts-ignore
                onClick={() => this.redirect(`/events/${event._id}`)}
            >
                <LinkedTD to={`/events/${event._id}`}>
                    {event.icon
                        ? <FontAwesomeIcon icon={event.icon} />
                        : undefined}
                </LinkedTD>

                <LinkedTD to={`/events/${event._id}`}>{event.name}</LinkedTD>
                <LinkedTD to={`/events/${event._id}`}>{event.venue}</LinkedTD>
                <LinkedTD to={`/events/${event._id}`}>
                    {moment(event.bookingStart).format(' dddd Do MMMM (YYYY), HH:mm ')}
                    &#8594;
                    {moment(event.bookingEnd).format(' dddd Do MMMM (YYYY), HH:mm ')}
                </LinkedTD>
                <LinkedTD to={`/events/${event._id}`}>
                    <ReactTimeAgo date={event.bookingStart} />
                </LinkedTD>
                <LinkedTD to={`/events/${event._id}`}>
                    {this.makeEntsStatus(event.entsStatus)}
                </LinkedTD>
                <LinkedTD to={`/events/${event._id}`}>
                    {this.makeEventState(event.state)}
                </LinkedTD>
            </tr>
        );
    }

    private redirect(to: string){
        this.setState((oldState) => ({
            ...oldState,
            forcedRedirect: to,
        }));
    }

    private filter(event: Event) {
        if ('name' in this.state.filters) {
            const filter = this.state.filters.name as SearchFilterStatus;

            if (!event.name.toLowerCase().includes(filter.content.toLowerCase())) return false;
        }

        if ('date' in this.state.filters) {
            const filter = this.state.filters.date as DateFilterStatus;

            if (filter.startDate !== null) {
                if (filter.startDate.isAfter(moment(event.bookingStart))) return false;
            }

            if (filter.endDate !== null) {
                if (filter.endDate.isBefore(moment(event.bookingEnd))) return false;
            }
        }

        if ('state' in this.state.filters) {
            const filter = this.state.filters.state as SelectFilterStatus;

            if (filter.selectedOption !== 'any') {
                if (event.state === undefined) return false;
                if (event.state.state !== filter.selectedOption) return false;
            }
        }

        if ('ents' in this.state.filters) {
            const filter = this.state.filters.ents as SelectFilterStatus;

            if (filter.selectedOption !== 'any') {
                if (event.entsStatus === undefined) return false;
                if (event.entsStatus.name !== filter.selectedOption) return false;
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

    render() {
        const states = this.props.events.map((e) => e.state === undefined ? undefined : e.state.state).filter((e) => e !== undefined).filter((value, index, self) => self.indexOf(value) === index) as string[];
        const ents = this.props.events.map((e) => e.entsStatus === undefined ? undefined : e.entsStatus.name).filter((e) => e !== undefined).filter((value, index, self) => self.indexOf(value) === index) as string[];
        const venues = this.props.events.map((e) => e.venue).filter((value, index, self) => self.indexOf(value) === index) as string[];

        // states.push('any');
        // ents.push('any');
        // venues.push('any');
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
