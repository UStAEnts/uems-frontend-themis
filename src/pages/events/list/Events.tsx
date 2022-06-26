import * as React from 'react';
import Loader from 'react-loader-spinner';
import {TabPane} from '../../../components/components/tab-pane/TabPane';
import {EventTable} from '../../../components/components/event-table/EventTable';
import {Theme} from '../../../theme/Theme';

import './Events.scss';
import {API, EventResponse} from '../../../utilities/APIGen';
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";
import {UIUtilities} from "../../../utilities/UIUtilities";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {CalendarRedo} from "../../../components/atoms/calendar/Calendar";
import moment, {Moment} from "moment";
import {Filter, FilterConfiguration} from "../../../components/components/filter/Filter";

export type CalendarPropsType = {} & NotificationPropsType;

export type CalendarStateType = {
    /**
     * The list of events loaded from the gateway
     */
    calendarEvents?: EventResponse[],
    tableEvents?: EventResponse[],
    start: Moment,
    end: Moment,
    selected?: string,

    calendarFilters: Record<string, FilterConfiguration>,
    tableFilters: Record<string, FilterConfiguration>,
} & FallibleReactStateType;


class EventsClass extends FallibleReactComponent<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    constructor(props: Readonly<CalendarPropsType>) {
        super(props);

        const start = moment().startOf('week').subtract('1', 'minute');
        const end = moment().startOf('week').add('7', 'days').subtract('1', 'minute');

        this.state = {
            start,
            end,
            tableFilters: {
                date: {
                    name: 'Event Date',
                    type: 'date',
                    value: {
                        startDate: start.toDate(),
                        endDate: end.toDate(),
                    }
                },
            },
            calendarFilters: {},
        };
    }

    componentDidMount() {
        this.setState((s) => ({...s, loading: true}), () => {
            API.events.get(new URLSearchParams({
                startafter: String(this.state.start.unix()),
                startbefore: String(this.state.end.unix()),
            })).then((data) => {
                if (data.status === 'PARTIAL') UIUtilities.tryShowPartialWarning(this);

                this.setState((s) => ({
                    ...s,
                    loading: false,
                    calendarEvents: data.result,
                    tableEvents: data.result,
                }));
            }).catch((err) => {
                this.setState((s) => ({
                    ...s,
                    loading: false,
                    error: `Failed to load events: ${err.message}`,
                }));
            });
        });
    }

    private fitersToQuery(filters: Record<string, FilterConfiguration>): URLSearchParams {
        console.log(filters);
        const params = new URLSearchParams();

        if (Object.prototype.hasOwnProperty.call(filters, 'name') && typeof (filters.name.value) === 'string') {
            params.set('name', filters.name.value);
        }

        if (Object.prototype.hasOwnProperty.call(filters, 'date') && typeof (filters.date.value) === 'object' && 'startDate' in filters.date.value) {
            params.set('startafter', String(filters.date.value.startDate.getTime() / 1000));
            params.set('startbefore', String(filters.date.value.endDate.getTime() / 1000));
        }

        if (Object.prototype.hasOwnProperty.call(filters, 'state')) {
            if (typeof (filters.state.value) === 'string') {
                if (filters.state.value !== 'any') params.set('stateID', filters.state.value);
            } else if (typeof (filters.state.value) === 'object' && 'value' in filters.state.value) {
                if (filters.state.value.value !== 'any') params.set('stateID', filters.state.value.value);
            }
        }

        if (Object.prototype.hasOwnProperty.call(filters, 'ents')) {
            if (typeof (filters.ents.value) === 'string') {
                if (filters.ents.value !== 'any') params.set('entsID', filters.ents.value);
            } else if (typeof (filters.ents.value) === 'object' && 'value' in filters.ents.value) {
                if (filters.ents.value.value !== 'any') params.set('entsID', filters.ents.value.value);
            }
        }

        if (Object.prototype.hasOwnProperty.call(filters, 'venues')) {
            if (typeof (filters.venues.value) === 'string') {
                if (filters.venues.value !== 'any') {
                    params.set('venueIDs', filters.venues.value);
                    params.set('venueCriteria', 'any');
                }
            } else if (typeof (filters.venues.value) === 'object' && 'value' in filters.venues.value) {
                if (filters.venues.value.value !== 'any') {
                    params.set('venueIDs', filters.venues.value.value);
                    params.set('venueCriteria', 'any');
                }
            }
        }

        console.log(params.toString());
        return params;
    }

    private updateCalendar() {

    }

    private updateTable() {
        this.fitersToQuery(this.state.tableFilters);
    }

    /**
     * Load the events from the API endpoint and update the state with the properties or populate the error state
     */
    private loadComments() {
        // loadAPIData<CalendarStateType>([{
        //     call: API.events.get,
        //     stateName: 'events',
        //     params: [
        //         ,
        //     ],
        // }], this.setState.bind(this), () => UIUtilities.tryShowPartialWarning(this));
    }

    realRender() {

        const loadOrError = this.state.error
            ? (
                <div>
                    {this.state.error}
                </div>
            )
            : (
                <div className="loading-pane">
                    <Loader
                        type="BallTriangle"
                        color={Theme.NOTICE}
                        height={100}
                        width={100}
                    />
                </div>
            );

        return (
            <div
                style={{
                    padding: '20px',
                }}
                className="events-page"
            >
                <TabPane
                    style={{flexGrow: 1}}
                    listeners={{
                        onTabChange: (_, pane) => this.setState((s) => ({...s, selected: pane.key})),
                    }}
                    panes={[
                        {
                            key: 'calendar',
                            content: (
                                this.state.calendarEvents
                                    ? <>
                                        <Filter filters={this.state.calendarFilters}/>
                                        <CalendarRedo
                                            events={this.state.calendarEvents}
                                            days={7}
                                            startDate={this.state.start.toDate()}
                                            onDateChange={(st, en) => this.setState((s) => ({
                                                ...s,
                                                start: st,
                                                end: en,
                                            }), () => this.loadComments())}
                                        />
                                    </>
                                    : loadOrError
                            ),
                            name: 'Calendar',
                            initial: this.state.selected === 'calendar',
                        },
                        {
                            name: 'Table',
                            content: (
                                this.state.tableEvents
                                    ? <EventTable
                                        events={this.state.tableEvents}
                                        filters={this.state.tableFilters}
                                        onFiltersChange={(e) => this.setState((s) => ({
                                            ...s,
                                            tableFilters: e,
                                        }), () => this.updateTable())}
                                    />
                                    : loadOrError
                            ),
                            key: 'table',
                            initial: this.state.selected ? this.state.selected === 'table' : true,
                        },
                    ]}
                />
            </div>
        );
    }

}

export const Events = withNotificationContext(EventsClass);
