/* eslint-disable */
import React from 'react';
import ReactTimeAgo from "react-time-ago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Theme } from "../../../theme/Theme";
import {
    DateFilterStatus,
    Filter,
    FilterConfiguration,
    NumberFilterStatus,
    SearchFilterStatus,
    SelectFilterStatus
} from "../filter/Filter";

import './EventTable.scss';
import moment from "moment";
import { LinkedTD } from "../../atoms/LinkedTD";
import { Redirect } from "react-router";
import { IconName } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from "../../../utilities/ColorUtilities";
import { KeyValueOption } from "../../atoms/select/Select";
import { API, EntsStateResponse, EventResponse, StateResponse, VenueResponse } from "../../../utilities/APIGen";

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

    loaded: {
        venues?: VenueResponse[],
        states?: StateResponse[],
        ents?: EntsStateResponse[],
    }
};

export class EventTable extends React.Component<EventTablePropsType, EventTableStateType> {

    static displayName = 'EventTable';

    constructor(props: Readonly<EventTablePropsType>) {
        super(props);

        this.state = {
            filters: {},
            loaded: {},
        };

        this.makeEntsStatus = this.makeEntsStatus.bind(this);
        this.makeEventState = this.makeEventState.bind(this);
        this.eventToRow = this.eventToRow.bind(this);
        this.filter = this.filter.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    componentDidMount() {
        API.venues.get().then((venues) => {
            this.setState((oldState) => {
                const clone = { ...oldState };

                clone.loaded.venues = venues.result;

                return clone;
            })
        }).catch((err) => {
            //TODO: add error handling
            console.error(err);
        });
        API.states.get().then((states) => {
            this.setState((oldState) => {
                const clone = { ...oldState };

                clone.loaded.states = states.result;

                return clone;
            })
        }).catch((err) => {
            //TODO: add error handling
            console.error(err);
        });
        API.ents.get().then((ents) => {
            this.setState((oldState) => {
                const clone = { ...oldState };

                clone.loaded.ents = ents.result;

                return clone;
            })
        }).catch((err) => {
            //TODO: add error handling
            console.error(err);
        });
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
                        style={{
                            backgroundColor: entsStatus.color,
                            color: ColorUtilities.determineForegroundColor(entsStatus.color)
                        }}
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
        return (
            <tr
                key={event.id}
                data-testid={`et-row-${event.id}`}
                // @ts-ignore
                onClick={() => this.redirect(`/events/${event.id}`)}
            >
                <LinkedTD to={`/events/${event.id}`}>
                    {/* TODO: Icons do not current exist on events */}
                    {/*{event.icon*/}
                    {/*    ? <FontAwesomeIcon icon={event.icon} />*/}
                    {/*    : undefined}*/}
                </LinkedTD>

                <LinkedTD to={`/events/${event.id}`}>{event.name}</LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>{event.venues.map((e) => e.name).join(', ')}</LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    {moment.unix(event.start).format(' dddd Do MMMM (YYYY), HH:mm ')}
                    &#8594;
                    {moment.unix(event.end).format(' dddd Do MMMM (YYYY), HH:mm ')}
                </LinkedTD>
                <LinkedTD to={`/events/${event.id}`}>
                    <ReactTimeAgo date={event.start} />
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
    private redirect(to: string) {
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
                if (filter.startDate.isAfter(moment.unix(event.start))) return false;
            }

            if (filter.endDate !== null) {
                if (filter.endDate.isBefore(moment.unix(event.end))) return false;
            }
        }

        if ('state' in this.state.filters) {
            const filter = this.state.filters.state as SelectFilterStatus;

            if (typeof (filter.selectedOption) === 'string') return true;

            if (filter.selectedOption.value !== 'any') {
                if (event.state?.name.toLowerCase() !== (filter.selectedOption.additional as StateResponse).name.toLowerCase()) return false;
            }
        }

        if ('ents' in this.state.filters) {
            const filter = this.state.filters.ents as SelectFilterStatus;

            if (typeof (filter.selectedOption) === 'string') return true;

            if (filter.selectedOption.value !== 'any') {
                if (event.ents?.name.toLowerCase() !== (filter.selectedOption.additional as EntsStateResponse).name.toLowerCase()) return false;
            }
        }

        if ('venues' in this.state.filters) {
            const filter = this.state.filters.venues as SelectFilterStatus;

            if (typeof (filter.selectedOption) === 'string') return true;

            if (filter.selectedOption.value !== 'any') {
                if(!event.venues.map((e) => e.name.toLowerCase()).includes((filter.selectedOption.additional as VenueResponse).name.toLowerCase())) return false;
                // if (event.venue?.name.toLowerCase() !== (filter.selectedOption.additional as VenueResponse).name.toLowerCase()) return false;
            }
        }

        return true;
    }

    /**
     * Renders the table with filters for name, date, state, ents and venues.
     */
    render() {
        const filters: { [key: string]: FilterConfiguration } = {
            'name': {
                name: 'Event Name',
                type: 'search',
            },
            'date': {
                name: 'Event Date',
                type: 'date',
            },
        };

        if (this.state.loaded.ents) {
            const entsFilter: KeyValueOption[] = this.state.loaded.ents.map((e) => ({
                value: e.id,
                text: e.name,
                additional: e,
            }));

            entsFilter.push({
                value: 'any',
                text: 'any',
            });

            filters['ents'] = {
                name: 'Ents Status',
                type: 'option',
                options: entsFilter,
            };
        }

        if (this.state.loaded.states) {
            const stateFilter: KeyValueOption[] = this.state.loaded.states.map((e) => ({
                additional: e,
                value: e.id,
                text: e.name,
            }));

            stateFilter.push({
                value: 'any',
                text: 'any',
            });

            filters['state'] = {
                name: 'Event State',
                type: 'option',
                options: stateFilter,
            };
        }

        if (this.state.loaded.venues) {
            const venueFilter: KeyValueOption[] = this.state.loaded.venues.map((e) => ({
                text: e.name,
                value: e.id,
                additional: e,
            }));

            venueFilter.push({
                value: 'any',
                text: 'any',
            });

            filters['venues'] = {
                name: 'Venue',
                type: 'option',
                options: venueFilter,
            };
        }


        return (
            <div className="events-table">
                {this.state.forcedRedirect
                    ? <Redirect to={this.state.forcedRedirect} />
                    : undefined}
                <Filter
                    filters={filters}
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
