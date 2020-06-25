import * as React from 'react';
import moment, { Moment } from 'moment';
import { Event } from '../../../types/Event';

import './Calendar.scss';
import { EventCard } from '../event-card/EventCard';

export type CalendarPropsType = {
    shortDays: boolean,
    startDate: Date,
    events: Event[],
};

export type CalendarStateType = {
    startMoment: Moment
};

export class Calendar extends React.Component<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    static defaultProps = {
        shortDays: false,
        startDate: new Date(2020, 5, 23),
    }

    private static padToTwo(input: any) {
        if (String(input).length !== 2) return `0${input}`;
        return input;
    }

    constructor(props: Readonly<CalendarPropsType>) {
        super(props);

        this.state = {
            startMoment: moment(this.props.startDate).isoWeekday(0),
        };

        // Bind any functions to always have the right this parameter
        const bindFunctions: Function[] = [
            this.renderHeader,
            this.changeDay,
        ];

        for (let func of bindFunctions) {
            func = func.bind(this);
        }
    }

    private changeDay(days: number) {
        this.setState((oldState) => ({
            startMoment: oldState.startMoment.add(days, 'days'),
        }));
    }

    /**
     * Renders the header elements of the calendar table. This will contain the days of the week, starting from the
     * date in the props with dates attached
     */
    private renderHeader() {
        const days: Moment[] = [];
        // const weekdays = moment.weekdays();

        // 7 Days from the start day
        for (let i = 0; i < 7; i++) days.push(this.state.startMoment.clone().add(i, 'days'));

        return (
            <div className="hour-row c-row">
                <div className="hour-label header" />
                {
                    days.map((day) => (
                        <div key={day.format('MMMM-DD dddd')} className="hour-entry header">
                            <div className="weekday">{day.format(this.props.shortDays ? 'ddd' : 'dddd')}</div>
                            <div className="date">{day.format('DD')}</div>
                            <div className="month">{day.format(this.props.shortDays ? 'MMM' : 'MMMM')}</div>
                        </div>
                    ))
                }
            </div>
        );
    }

    private renderHourBox(time: Moment) {
        const limit = time.clone().add(31, 'minutes');

        const events = this.props.events
            .map((e) => e)
            .filter((e) => e.bookingStart.getTime() >= time.valueOf()
                && e.bookingStart.getTime() < limit.subtract('1', 'minute').valueOf())
            .map((event) => <EventCard event={event} collapsed />);
        return <div className="hour-entry">{events}</div>;
    }

    private renderHourRow(hour: number, minute: number) {
        const entries = [];

        for (let i = 0; i < 7; i++) {
            entries.push(this.renderHourBox(this.state.startMoment.clone().add(i, 'days').hour(hour).minute(minute)
                .second(0)));
        }

        return (
            <div className="hour-row c-row">
                <div className="hour-label">{`${Calendar.padToTwo(hour)}:${Calendar.padToTwo(minute)}`}</div>
                {entries}
            </div>
        );
    }

    private renderHourRows() {
        const components = [];
        let mom = moment('2001-01-01T00:00:00+00:00');

        for (let i = 0; i < 48; i++) {
            components.push(this.renderHourRow(mom.hour(), mom.minute()));
            mom = mom.add(30, 'minutes');
        }

        return components;
    }

    render() {
        return (
            <div className="calendar">
                {this.renderHeader()}
                <div className="hour-sequence">
                    {this.renderHourRows()}
                </div>
                <button
                    type="button"
                    onClick={() => this.changeDay(-1)}
                >
                    Minus One
                </button>
                <button
                    type="button"
                    onClick={() => this.changeDay(1)}
                >
                    Add One
                </button>
            </div>
        );
    }

}
