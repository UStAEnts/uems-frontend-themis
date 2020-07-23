import * as React from 'react';
import moment, { Moment } from 'moment';

import './Calendar.scss';
import { EventCard } from '../../atoms/event-card/EventCard';
import { EventResponse } from '../../../utilities/APITypes';

export type CalendarPropsType = {
    /**
     * The initial date on which this calendar should start (the user can change this)
     */
    startDate: Date,
    /**
     * This list of events to display in this event
     */
    events: EventResponse[],
};

export type CalendarStateType = {
    /**
     * The current starting day of the calendar (time is ignored)
     */
    startMoment: Moment
};

export class Calendar extends React.Component<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    static defaultProps = {
        startDate: new Date(),
    }

    /**
     * Pads the given input value to minimum two characters by appending a '0' to the start if it is only 1 character
     * long. Supports numbers as well
     * @param input the input string which needs padding to 2 characters
     */
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

    /**
     * Changes the start day in the state by this many days.
     * @param days the amount of days to move the calendar start date by
     */
    private changeDay(days: number) {
        this.setState((oldState) => ({
            startMoment: oldState.startMoment.add(days, 'days'),
        }));
    }

    /**
     * Renders the header elements of the calendar table. This will contain the days of the week, starting from the
     * date in the state with dates attached
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
                    days.map((day, index) => (
                        <div
                            key={day.format('MMMM-DD dddd')}
                            className="hour-entry header"
                            data-testid={`n${index}-header`}
                        >
                            <div className="weekday">{day.format('dddd')}</div>
                            <div className="date">{day.format('DD')}</div>
                            <div className="month">{day.format('MMMM')}</div>
                        </div>
                    ))
                }
            </div>
        );
    }

    /**
     * Renders a box for this time entry containing all events that start in this half hour slot, adding them as
     * collapsed event cards
     * @param time the time that this hour box should be rendered for
     */
    private renderHourBox(time: Moment) {
        const limit = time.clone().add(31, 'minutes');

        const events = this.props.events
            // Filter only those that start at the right time
            .filter((e) => e.startDate >= time.valueOf()
                && e.endDate < limit.subtract('1', 'minute').valueOf())
            // Map them to event cards
            .map((event) => <EventCard event={event} collapsed />);

        return <div className="hour-entry">{events}</div>;
    }

    /**
     * Renders a row of days for the given hour minute combination calling {@link renderHourBox} for each day and
     * then wrapping them all up in a row with a label as well
     * @param hour the hour of this row
     * @param minute the minute of this row
     */
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

    /**
     * Renders all the hour rows from 00:00 to 23:30 containing all the events within them.
     */
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
