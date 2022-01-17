import React from 'react';
import moment from 'moment';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis
} from 'recharts';
import {
    API,
    EntsStateResponse,
    EventResponse,
    StateResponse,
    SuccessfulAPIResponse,
    VenueResponse
} from '../../utilities/APIGen';
import {failEarlyStateSet} from '../../utilities/AccessUtilities';
import {NotificationPropsType} from '../../context/NotificationContext';
import {UIUtilities} from '../../utilities/UIUtilities';
import './Dashboard.scss';
import {Theme} from '../../theme/Theme';
import {Tag} from '../../components/atoms/tag/Tag';
import {Button} from '../../components/atoms/button/Button';
import {ValueSquare} from '../../components/atoms/value-square/ValueSquare';
import {GenericList, genericRender} from '../../components/components/generic-list/GenericList';
import {RenderUtilities} from '../../utilities/RenderUtilities';
import {withNotificationContext} from "../../components/WithNotificationContext";
import {faAdjust} from "@fortawesome/free-solid-svg-icons";

export type DashboardPropsType = {} & NotificationPropsType;

export type DashboardStateType = {
    events?: EventResponse[],
    venues?: VenueResponse[],
    entsState?: EntsStateResponse[],
    buildingState?: StateResponse[],

    chartType: 'date' | 'state' | 'ents' | 'venue',

    processed: {
        eventsByDate: {
            raw?: object[],
            byVenue?: {},
            byEnts?: {},
            byState?: {},
        }
    }
};

type EventDataPoint = {
    x: number,
    y: number,
    events: EventResponse[],
    date: moment.Moment,
    [key: string]: any,
};

const EventStackTooltip: React.FunctionComponent<TooltipProps> = (
    {active, payload},
) => {
    if (!active) return null;
    if (!payload) return null;
    if (payload.length < 1) return null;

    const data: EventDataPoint = payload[0].payload;
    const {events} = data;

    return (
        <div className="event-stack-tooltip">
            <div className="date">
                {data.date.format('dddd Do MMMM (YYYY)')}
            </div>
            <div className="title">Events</div>
            <div className="events">
                {events.map((event) => (
                    <div className="event-line">
                        {event.name}
                        <br/>
                        {event.venues.map((e) => e.name).join(', ')}
                        <br/>
                        <Tag tag={event.ents}/>
                        <Tag tag={event.state}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

class DashboardClass extends React.Component<DashboardPropsType, DashboardStateType> {

    static displayName = 'Dashboard';

    extract<T extends SuccessfulAPIResponse>(data: T): T['result'] {
        if (data.status === 'PARTIAL') UIUtilities.tryShowPartialWarning(this);
        return Promise.resolve(data.result);
    }

    constructor(props: Readonly<DashboardPropsType>) {
        super(props);
        this.state = {
            processed: {
                eventsByDate: {},
            },
            chartType: 'date',
        };
    }

    componentDidMount() {
        API.events.get().then(this.extract)
            .then(failEarlyStateSet(this.state, this.setState.bind(this), 'events'))
            .then(this.processEvents)
            .catch(() => UIUtilities.failedLoad(this.props.notificationContext, 'the events could not be loaded'));
        API.venues.get().then(this.extract)
            .then(failEarlyStateSet(this.state, this.setState.bind(this), 'venues'))
            .then(this.processEvents)
            .catch(() => UIUtilities.failedLoad(this.props.notificationContext, 'the venues could not be loaded'));
        API.ents.get().then(this.extract)
            .then(failEarlyStateSet(this.state, this.setState.bind(this), 'entsState'))
            .then(this.processEvents)
            .catch(() => UIUtilities.failedLoad(this.props.notificationContext, 'the ents could not be loaded'));
        API.states.get().then(this.extract)
            .then(failEarlyStateSet(this.state, this.setState.bind(this), 'buildingState'))
            .then(this.processEvents)
            .catch(() => UIUtilities.failedLoad(this.props.notificationContext, 'the states could not be loaded'));
    }

    private processEvents = async () => {
        if (!this.state.events) return;
        if (!this.state.buildingState) return;
        if (!this.state.venues) return;
        if (!this.state.entsState) return;

        let raw: EventDataPoint[] = [];
        const rawPre: { [key: number]: EventResponse[] } = {};

        for (const event of this.state.events) {
            const date = moment.unix(event.start).startOf('day').unix();

            if (Object.prototype.hasOwnProperty.call(rawPre, date)) {
                rawPre[date].push(event);
            } else {
                rawPre[date] = [event];
            }
        }

        for (const [date, events] of Object.entries(rawPre) as unknown as [number, EventResponse[]][]) {
            const entry: EventDataPoint = {
                events,
                x: date,
                y: events.length,
                date: moment.unix(date),
            };

            for (const state of this.state.buildingState) {
                entry[`st-${state.name}`] = events.filter((e) => e.state?.id === state.id).length;
            }
            for (const state of this.state.entsState) {
                entry[`en-${state.name}`] = events.filter((e) => e.ents?.id === state.id).length;
            }
            for (const state of this.state.venues) {
                entry[`ve-${state.name}`] = events.filter((e) => e.venues.map((e) => e.id).includes(state.id)).length;
            }

            raw.push(entry);
        }

        raw = raw.sort((a, b) => a.x - b.x);

        failEarlyStateSet(
            this.state,
            this.setState.bind(this),
            'processed',
            'eventsByDate',
            'raw',
        )(raw);
    }

    render() {
        let themeIterator = Theme.ALL[Symbol.iterator]();

        const nextColor = () => {
            const next = themeIterator.next();

            if (next.done) themeIterator = Theme.ALL[Symbol.iterator]();

            return next.value;
        };

        let lineGroup: (EntsStateResponse | VenueResponse | StateResponse)[];
        let prefix: string;
        switch (this.state.chartType) {
            case 'date':
                lineGroup = [];
                break;
            case 'ents':
                lineGroup = this.state.entsState ?? [];
                prefix = 'en-';
                break;
            case 'venue':
                lineGroup = this.state.venues ?? [];
                prefix = 've-';
                break;
            case 'state':
                lineGroup = this.state.buildingState ?? [];
                prefix = 'st-';
                break;
            default:
                lineGroup = [];
                break;
        }
        // UNSAFE: what if we are done?

        const lines = lineGroup.map((e) => (
            <Line dataKey={`${prefix}${e.name}`} name={e.name} strokeWidth={2} type="monotone" stroke={nextColor()}/>
        ));

        const limit = (new Date().getTime() / 1000) + 604800; // + 7 days in seconds
        const eventsInNext7Days = (this.state.events ?? []).filter((e) => e.start < limit);

        return (
            <div className="dashboard">
                <div className="top-bar card">
                    <div className="title">At a Glance</div>
                    <div className="boxes">
                        <ValueSquare
                            value={this.state.events?.length ?? '?'}
                            name="Events"
                            color={nextColor()}
                            link="/events"
                        />
                        <ValueSquare
                            value={this.state.buildingState?.length ?? '?'}
                            name="States"
                            color={nextColor()}
                            link="/states"
                        />
                        <ValueSquare
                            value={this.state.entsState?.length ?? '?'}
                            name="Ents States"
                            color={nextColor()}
                            link="/ents"
                        />
                        <ValueSquare
                            value={this.state.venues?.length ?? '?'}
                            name="Venues"
                            color={nextColor()}
                            link="/venues"
                        />
                        <ValueSquare
                            value={eventsInNext7Days.length}
                            name="Events within 7 Days"
                            color={nextColor()}
                        />
                    </div>
                </div>
                <div className="core">
                    <div className="card half">
                        <div className="title">Events</div>
                        <Button
                            color={this.state.chartType === 'date' ? Theme.PURPLE : Theme.PURPLE_LIGHT}
                            text="By Date"
                            onClick={() => failEarlyStateSet(this.state, this.setState.bind(this), 'chartType')(
                                'date',
                            )}
                        />
                        <Button
                            color={this.state.chartType === 'venue' ? Theme.BLUE : Theme.BLUE_LIGHT}
                            text="By Venue"
                            onClick={() => failEarlyStateSet(this.state, this.setState.bind(this), 'chartType')(
                                'venue',
                            )}
                        />
                        <Button
                            color={this.state.chartType === 'state' ? Theme.TEAL : Theme.TEAL_LIGHT}
                            text="By State"
                            onClick={() => failEarlyStateSet(this.state, this.setState.bind(this), 'chartType')(
                                'state',
                            )}
                        />
                        <Button
                            color={this.state.chartType === 'ents' ? Theme.RED : Theme.RED_LIGHT}
                            text="By Ents"
                            onClick={() => failEarlyStateSet(this.state, this.setState.bind(this), 'chartType')(
                                'ents',
                            )}
                        />
                        {
                            this.state.processed.eventsByDate.raw
                                ? (
                                    <ResponsiveContainer height={400}>
                                        <LineChart
                                            data={this.state.processed.eventsByDate.raw}
                                        >
                                            <Legend/>
                                            <Line
                                                dataKey="y"
                                                name="Total Events"
                                                type="monotone"
                                                strokeWidth={3}
                                            />
                                            {lines}
                                            <YAxis
                                                dataKey="y"
                                            />
                                            <XAxis
                                                dataKey="x"
                                                tickFormatter={(value) => moment.unix(value).format('DD/MM')}
                                            />
                                            <Tooltip
                                                content={<EventStackTooltip/>}
                                            />
                                            <CartesianGrid/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                )
                                : undefined
                        }

                    </div>
                    <div className="card half">
                        <div className="title">Upcoming</div>
                        <GenericList
                            records={(this.state.events ?? []).map((e) => ({
                                value: e,
                                target: `/events/${e.id}`,
                                identifier: e.id,
                            }))}
                            render={RenderUtilities.renderBasicEvent}
                        />
                    </div>
                    <div className="card half">
                        <div className="title">Ents States</div>
                        <GenericList
                            records={(this.state.entsState ?? []).map((e) => ({
                                value: e,
                                target: `/ents/${e.id}`,
                                identifier: e.id,
                            }))}
                            render={genericRender()}
                        />
                    </div>
                    <div className="card half">
                        <div className="title">Building States</div>
                        <GenericList
                            records={(this.state.buildingState ?? []).map((e) => ({
                                value: e,
                                target: `/states/${e.id}`,
                                identifier: e.id,
                            }))}
                            render={genericRender()}
                        />
                    </div>
                    <div className="card half">
                        <div className="title">Venues</div>
                        <GenericList
                            records={(this.state.venues ?? []).map((e) => ({
                                value: e,
                                target: `/venues/${e.id}`,
                                identifier: e.id,
                            }))}
                            render={genericRender(['date', 'user'])}
                        />
                    </div>
                </div>
            </div>
        );
    }

}

export const Dashboard = withNotificationContext(DashboardClass);
