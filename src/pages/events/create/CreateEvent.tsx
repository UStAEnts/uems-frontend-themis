import React from 'react';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { KeyValueOption, Select } from '../../../components/atoms/select/Select';
import './CreateEvent.scss';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { Redirect, withRouter } from 'react-router';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { faExclamationCircle, faSkullCrossbones, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { Notification } from '../../../components/components/notification-renderer/NotificationRenderer';
import { API, EntsStateResponse, EventCreation, StateResponse, VenueResponse } from '../../../utilities/APIGen';
import { failEarlySet, failEarlyStateSet } from '../../../utilities/AccessUtilities';

export type CreateEventPropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
};

export type CreateEventStateType = {
    eventProperties: {
        name?: string,
        dates: {
            startDate?: Date,
            endDate?: Date,
        },
        attendance?: number,
        icon?: string,
        state?: StateResponse,
        ents?: EntsStateResponse,
        venue?: VenueResponse,
    },
    loaded: {
        venues: VenueResponse[],
        states: StateResponse[],
        ents: EntsStateResponse[],
    },
    uiProperties: {
        dateFocused: 'startDate' | 'endDate' | null,
        redirect?: string,
    }
};

class CreateEventClass extends React.Component<CreateEventPropsType, CreateEventStateType> {

    static displayName = 'Create Event';

    constructor(props: Readonly<CreateEventPropsType>) {
        super(props);

        this.state = {
            eventProperties: {
                dates: {},
            },
            loaded: {
                venues: [],
                ents: [],
                states: [],
            },
            uiProperties: {
                dateFocused: null,
            },
        };

    }

    componentDidMount() {
        API.ents.get().then(
            (d) => failEarlyStateSet(this.state, this.setState.bind(this), 'loaded', 'ents')(d.result),
        ).catch(() => {
            this.showFailNotification('Failed to load data', 'Could not load ents state data');
        });
        API.states.get().then(
            (d) => failEarlyStateSet(this.state, this.setState.bind(this), 'loaded', 'states')(d.result),
        ).catch(() => () => {
            this.showFailNotification('Failed to load data', 'Could not load event state data');
        });
        API.venues.get().then(
            (d) => failEarlyStateSet(this.state, this.setState.bind(this), 'loaded', 'venues')(d.result),
        ).catch(() => () => {
            this.showFailNotification('Failed to load data', 'Could not load venue data');
        });
    }

    private showNotification = (
        title: string,
        content?: string,
        icon?: IconDefinition,
        color?: string,
        action?: Notification['action'],
    ) => {
        if (this.props.notificationContext) { // @ts-ignore
            this.props.notificationContext.showNotification(title, content, icon, color, action);
        }
    }

    private saveEvent = () => {
        const warn = (title: string, description: string) => {
            this.showNotification(title, description, faExclamationCircle, Theme.WARNING);
        };

        if (this.state.eventProperties.name === undefined) {
            warn('Invalid Event Name', 'You must provide an event name');
            return;
        }
        if (this.state.eventProperties.venue === undefined) {
            warn('Invalid Venue', 'You must provide a venue');
            return;
        }
        if (this.state.eventProperties.dates.startDate === undefined) {
            warn('Invalid Start Date', 'You must provide a start date');
            return;
        }
        if (this.state.eventProperties.dates.endDate === undefined) {
            warn('Invalid End Date', 'You must provide an end date');
            return;
        }
        if (this.state.eventProperties.attendance === undefined) {
            warn('Invalid Attendance', 'You must provide an attendance figure');
            return;
        }

        if (this.state.eventProperties.dates.endDate.getTime() < this.state.eventProperties.dates.startDate.getTime()) {
            warn('Invalid End Date', 'End date must be after the start date');
            return;
        }

        if (this.state.eventProperties.dates.startDate.getTime() < new Date().getTime()) {
            warn('Invalid Start Date', 'Start date must be after right now');
        }

        const event: EventCreation = {
            endDate: this.state.eventProperties.dates.endDate.getTime(),
            startDate: this.state.eventProperties.dates.startDate.getTime(),
            name: this.state.eventProperties.name,
            ents: this.state.eventProperties.ents?.id,
            attendance: this.state.eventProperties.attendance,
            state: this.state.eventProperties.state?.id,
            venue: this.state.eventProperties.venue.id,
        };

        API.events.post(event).then((id) => {
            failEarlySet(this.state, 'uiProperties', 'redirect')(`/events/${id.result.id}`);
        }).catch((err) => {
            // TODO: better error handling
            this.showNotification(
                'Failed to create event',
                `There was an error when saving the event: ${err.message}`,
                faSkullCrossbones,
                Theme.FAILURE,
            );
        });
    }

    private showFailNotification = (title: string, message: string) => {
        if (this.props.notificationContext) {
            try {
                this.props.notificationContext.showNotification(
                    title,
                    message,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
            } catch (e) {
                console.error('Notification system is not initialised');
            }
        }
    }

    private makeQuickAttendanceSelect = (name: string, attendance: number) => (
        <Button
            color={Theme.GRAY_LIGHT}
            text={`${attendance} - ${name}`}
            // onClick={() => this.updateEventProperty('attendance')(attendance)}
            onClick={() => failEarlySet(this.state, 'eventProperties', 'attendance')(attendance)}
        />
    )

    render() {
        return (
            <div className={`create-event ${this.props.isPage ? 'page' : ''}`}>
                {
                    this.state.uiProperties.redirect ? <Redirect to={this.state.uiProperties.redirect} /> : undefined
                }
                <div className="title">Create Event</div>
                <TextField
                    name="Event Name"
                    initialContent={this.state.eventProperties.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'eventProperties', 'name')}
                    required
                />
                <Select
                    placeholder="Venue"
                    name="Venue"
                    options={this.state.loaded.venues.map((e) => ({
                        text: e.name,
                        value: e.name,
                        additional: e,
                    }))}
                    onSelectListener={(option: KeyValueOption) => failEarlyStateSet(
                        this.state,
                        this.setState.bind(this),
                        'eventProperties',
                        'venue',
                    )(option.additional)}
                />
                <TextField
                    onChange={failEarlyStateSet(
                        this.state,
                        this.setState.bind(this),
                        'eventProperties', 'dates', 'startDate',
                    )}
                    name="start-date"
                    placeholder="Event Start Date"
                    required
                    type="datetime"
                />
                <TextField
                    onChange={failEarlyStateSet(
                        this.state,
                        this.setState.bind(this),
                        'eventProperties', 'dates', 'endDate',
                    )}
                    name="end-date"
                    placeholder="Event End Date"
                    required
                    type="datetime"
                />
                <TextField
                    name="Projected Attendance"
                    initialContent={this.state.eventProperties.attendance}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'eventProperties', 'attendance')}
                    required
                    type="number"
                />
                <div className="label">Quick Select</div>
                {
                    ([
                        ['Seated StAge', 121],
                        ['Beacon Bar', 140],
                        ['Sandy\'s Bar', 100],
                        ['601 (Standing)', 400],
                        ['StAge (Standing)', 345],
                        ['StAge (Theatre)', 165],
                        ['601 & StAge', 1200],
                    ] as [string, number][]).map(
                        (a) => this.makeQuickAttendanceSelect(a[0], a[1]),
                    )
                }
                <Select
                    placeholder="Status"
                    name="status"
                    options={this.state.loaded.states.map((e) => ({
                        text: e.name,
                        value: e.name,
                        additional: e,
                    }))}
                    onSelectListener={(option: KeyValueOption) => failEarlyStateSet(
                        this.state,
                        this.setState.bind(this),
                        'eventProperties',
                        'state',
                    )(option.additional)}
                />
                <Select
                    placeholder="Ents State"
                    name="ents"
                    options={this.state.loaded.ents.map((e) => ({
                        text: e.name,
                        value: e.name,
                        additional: e,
                    }))}
                    onSelectListener={(option: KeyValueOption) => failEarlyStateSet(
                        this.state,
                        this.setState.bind(this),
                        'eventProperties',
                        'ents',
                    )(option.additional)}
                />
                <Button
                    color={Theme.SUCCESS}
                    text="Submit"
                    fullWidth={this.props.isPage}
                    onClick={this.saveEvent}
                />
                {
                    this.props.isPage ? undefined
                        : (
                            <Button color={Theme.FAILURE} text="Cancel" />
                        )
                }
            </div>
        );

    }

}

// @ts-ignore
export const CreateEvent = withRouter(withNotificationContext(CreateEventClass));
