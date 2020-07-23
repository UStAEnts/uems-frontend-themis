import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Loader from 'react-loader-spinner';

import './Event.scss';
import moment from 'moment';
import Axios from 'axios';
import ReactTimeAgo from 'react-time-ago';
import urljoin from 'url-join';
import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { withNotificationContext } from '../../components/WithNotificationContext';
import { NotificationContextType } from '../../context/NotificationContext';
import { FileList } from '../../components/atoms/file-bar/FileBar';
import { CommentList } from '../../components/components/comment-list/CommentList';
import Config from '../../config/Config';
import { EditableProperty } from '../../components/components/editable-property/EditableProperty';
import { Theme } from '../../theme/Theme';
import { KeyValueOption } from '../../components/atoms/select/Select';
import {
    CommentResponse,
    EntsStateResponse,
    EventPropertyChangeResponse,
    EventResponse, EventUpdate,
    FileResponse,
    StateResponse,
} from '../../utilities/APITypes';
import { API } from '../../utilities/NetworkUtilities';

export type EventPropsType = {
    notificationContext?: NotificationContextType,
} & RouteComponentProps<{
    /**
     * The ID of the event to be rendered. This will be looked up from the API endpoint
     */
    id: string
}>

export type EventStateType = {
    /**
     * The ID of this event
     */
    id?: string,
    /**
     * The retrieved event properties
     */
    event?: EventResponse,
    changelog?: EventPropertyChangeResponse[],
    /**
     * The list of possible ents states to which this event can be updated
     */
    entsStates?: EntsStateResponse[],
    /**
     * The list of possible building states to which this event can be updated
     */
    buildingStates?: StateResponse[],
    files?: FileResponse[],
    comments?: CommentResponse[],
    /**
     * The venues that this event could take place in
     */
    venues?: string[],
};

class Event extends React.Component<EventPropsType, EventStateType> {

    static displayName = 'Event';

    constructor(props: Readonly<EventPropsType>) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
        };
    }

    /**
     * When the components mount, we need to query the API for the actual properties we need
     */
    componentDidMount() {
        API.events.id.this.get(this.props.match.params.id).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                event: data.event,

                // Changelog is provided on the /event/{id} endpoint but no where else (not on patch)
                changelog: data.changelog,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load event: ${err.message}`);
        });

        Axios.get(
            urljoin(
                Config.BASE_GATEWAY_URI,
                'events',
                encodeURIComponent(this.props.match.params.id),
                'comments',
            ),
        ).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                comments: data.data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load comments: ${err.message}`);
        });

        Axios.get(
            urljoin(
                Config.BASE_GATEWAY_URI,
                'events',
                encodeURIComponent(this.props.match.params.id),
                'files',
            ),
        ).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                files: data.data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load event: ${err.message}`);
        });

        Axios.get(urljoin(
            Config.BASE_GATEWAY_URI,
            'venues',
        )).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                venues: data.data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load list of venues: ${err.message}`);
        });

        Axios.get(urljoin(
            Config.BASE_GATEWAY_URI,
            'ents',
        )).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                entsStates: data.data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load list of ents states: ${err.message}`);
        });

        Axios.get(urljoin(
            Config.BASE_GATEWAY_URI,
            'states',
        )).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                buildingStates: data.data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load list of ents states: ${err.message}`);
        });
        //
        // // Pretend this is done via axios!
        // setTimeout(() => {
        //     this.setState((oldState) => ({
        //         ...oldState,
        //         event: {
        //             _id: oldState.id,
        //             attendance: 300,
        //             bookingEnd: moment().add(7, 'hours').toDate(),
        //             bookingStart: moment().add(1, 'hour').toDate(),
        //             name: 'Some Event',
        //             venue: 'StAge',
        //         } as GatewayEvent,
        //     }))
        //
        //     setTimeout(() => {
        //         this.setState((oldState) => ({
        //             ...oldState,
        //             venues: ['StAge', '601', 'Stage and 601'],
        //             entsStates: [
        //                 { name: 'ready' },
        //                 { name: 'signup' },
        //                 { name: 'awaiting requirements' },
        //             ],
        //             buildingStates: [
        //                 { state: 'ready' },
        //                 { state: 'approved' },
        //                 { state: 'cancelled' },
        //             ]
        //         }));
        //     }, 1000);
        // }, 500);
    }

    private failedLoad = (reason: string) => {
        if (this.props.notificationContext) {
            try {
                this.props.notificationContext.showNotification(
                    'Failed to Load',
                    `There was an error: ${reason}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
                console.log('Notification shown');
            } catch (e) {
                console.error('Notification system failed to send');
            }
        }
    }

    private patchEvent = (changeProps: EventUpdate) => {
        if (!this.state.event) return;

        // TODO: check this is alright
        // if (changeProps.startDate instanceof Date) changed.bookingStart = changeProps.bookingStart.getTime();
        // if (changeProps.bookingEnd instanceof Date) changed.bookingEnd = changeProps.bookingEnd.getTime();

        API.events.id.this.patch(this.state.event.id, changeProps).then(() => {
            // The response only contains an ID so we need to spread the updated parameters on top of the existing ones
            this.setState((oldState) => ({
                ...oldState,
                ...changeProps,
            }));
        }).catch((err) => {
            // TODO: figure out how to raise errors and display them properly!
            console.error(err);
            this.failedLoad('Could not save the event!');
        });

        // Axios.patch(
        //     url.resolve(
        //         Config.BASE_GATEWAY_URI,
        //         `/event/${encodeURIComponent(this.state.event.id)}`,
        //     ),
        //     changed,
        //     {
        //         headers: {
        //             Accepts: 'application/json',
        //         },
        //     },
        // ).then((data) => {
        //     this.setState((oldState) => ({
        //         ...oldState,
        //         event: data.data.result,
        //     }));
        // }).catch((err) => {
        //     // TODO: figure out how to raise errors!
        //     console.error(err);
        // });
    }

    private changeStartTime = (date: Date) => {
        // TODO: timezone issues?
        this.patchEvent({
            startDate: date.getTime(),
        });
    }

    private changeEndTime = (date: Date) => {
        // TODO: timezone issues?
        this.patchEvent({
            endDate: date.getTime(),
        });
    }

    /**
     * Generates a select editable property with the values provided. This currently does not support an udpate handler
     * @param options the options which the user should be able to select
     * @param name the name of the property which could be changed
     * @param selected the currently selected value
     */
    private generateEditableProperty = (
        options: string[] | KeyValueOption[] | undefined,
        name: string, selected: string | undefined,
        property: keyof EventUpdate,
    ) => (
        options ? (
            <EditableProperty
                name={name}
                config={{
                    options,
                    type: 'select',
                    onChange: this.changeProperty(property),
                }}
            >
                <div className="value">{selected || 'Not set'}</div>
            </EditableProperty>
        ) : (
            <div>
                <div className="value">{selected || 'Not set'}</div>
                <div className="loader">
                    <Loader
                        type="Grid"
                        color={Theme.NOTICE}
                        width={20}
                        height={20}
                    />
                </div>
            </div>
        )
    )

    private changeProperty(property: keyof EventUpdate) {
        return (e: any) => {
            const changes: EventUpdate = {};

            changes[property] = e;

            this.patchEvent(changes);
        };
    }

    render() {
        return this.state.event ? (
            <div className="event-view loaded">
                <div className="real">
                    <h1>{this.state.event.name}</h1>
                    <div className="properties-bar">
                        <div className="property author">
                            <span className="label">Created By</span>
                            <span className="value">Unknown</span>
                        </div>
                        <div className="property creation">
                            <span className="label">Created</span>
                            <span className="value">
                                <ReactTimeAgo date={this.state.event.startDate} />
                            </span>
                        </div>
                        <div className="property updates">
                            <span className="label">Updates</span>
                            <span className="value">20</span>
                        </div>
                    </div>
                    {/* TODO: add file loading */}
                    {
                        this.state.files
                            ? (<FileList files={this.state.files} />)
                            : undefined
                    }
                    {/* <FileList files={[ */}
                    {/*    { */}
                    {/*        private: false, */}
                    {/*        size: 1000, */}
                    {/*        filename: 'Some file.txt', */}
                    {/*        name: 'Rider', */}
                    {/*        author: { */}
                    {/*            username: 'ryan', */}
                    {/*            name: 'Ryan Delaney', */}
                    {/*        }, */}
                    {/*        created: new Date().getTime(), */}
                    {/*        downloadURL: '/files/x', */}
                    {/*        id: 'abcd' */}
                    {/*    }, */}
                    {/*    { */}
                    {/*        private: true, */}
                    {/*        size: 1000, */}
                    {/*        filename: 'Some file.txt', */}
                    {/*        name: 'Rider', */}
                    {/*        author: { */}
                    {/*            username: 'ryan', */}
                    {/*            name: 'Ryan Delaney', */}
                    {/*        }, */}
                    {/*        created: new Date().getTime(), */}
                    {/*        downloadURL: '/files/x', */}
                    {/*        id: 'abcd' */}
                    {/*    }, */}
                    {/* ]} /> */}
                    {
                        this.state.comments
                            ? <CommentList comments={this.state.comments} />
                            : undefined
                    }
                </div>
                <div className="rightbar-real">
                    <div className="entry">
                        <div className="title">Venue</div>
                        {this.generateEditableProperty(
                            this.state.venues,
                            'Venue',
                            this.state.event.venue,
                            'venue',
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Ents State</div>
                        {this.generateEditableProperty(
                            this.state.entsStates
                                ? this.state.entsStates.map((e) => ({
                                    text: e.name,
                                    value: e.id,
                                    additional: e,
                                }))
                                : undefined,
                            'Ents State',
                            this.state.event.ents
                                ? this.state.event.ents.name
                                : undefined,
                            'ents',
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Building Status</div>
                        {this.generateEditableProperty(
                            this.state.buildingStates
                                ? this.state.buildingStates.map((e) => ({
                                    text: e.name,
                                    value: e.id,
                                    additional: e,
                                }))
                                : undefined,
                            'Building State',
                            this.state.event.state
                                ? this.state.event.state.name
                                : undefined,
                            'state',
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Timing</div>
                        <div className="value flow">
                            <div className="label">
                                Booking Start
                            </div>
                            <div className="time">
                                <EditableProperty
                                    name="Booking Start"
                                    config={{
                                        type: 'date',
                                        value: new Date(this.state.event.startDate),
                                        onChange: this.changeStartTime,
                                    }}
                                >
                                    {moment.unix(this.state.event.startDate).format('dddd Do MMMM (YYYY), HH:mm')}
                                </EditableProperty>
                            </div>
                            <div className="bar" />
                            <div className="duration">
                                {moment.duration(
                                    moment.unix(this.state.event.startDate).diff(moment.unix(this.state.event.endDate)),
                                ).humanize()}
                            </div>
                            <div className="bar" />
                            <div className="label">
                                Booking End
                            </div>
                            <div className="time">
                                <EditableProperty
                                    name="Booking End"
                                    config={{
                                        type: 'date',
                                        value: new Date(this.state.event.endDate),
                                        onChange: this.changeEndTime,
                                    }}
                                >
                                    {moment.unix(this.state.event.endDate).format('dddd Do MMMM (YYYY), HH:mm')}
                                </EditableProperty>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rightbar-spacer" />
            </div>
        ) : (
            <div className="event-view loading-pane">
                <Loader
                    type="BallTriangle"
                    color={Theme.NOTICE}
                    width={100}
                    height={100}
                />
            </div>
        );
    }

}

/**
 * Bind the event page with the router so we can access the ID if the path
 */
// @ts-ignore
export default withRouter(withNotificationContext(Event));
