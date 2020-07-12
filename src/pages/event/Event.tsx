import { EntsStatus, EventChange, EventState, GatewayEvent, GatewayFile } from "../../types/Event";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import Loader from "react-loader-spinner";
import { Theme } from "../../theme/Theme";

import './Event.scss';
import moment from "moment";
import { EditableProperty } from "../../components/components/editable-property/EditableProperty";
import Axios from "axios";
import Config from "../../config/Config";
import * as url from "url";
import { CommentList } from "../../components/components/comment-list/CommentList";
import { FileList } from "../../components/atoms/file-bar/FileBar";
import ReactTimeAgo from "react-time-ago";
import urljoin from "url-join";
import { NotificationContextType } from "../../context/NotificationContext";
import { withNotificationContext } from "../../components/WithNotificationContext";
import { faSkullCrossbones } from "@fortawesome/free-solid-svg-icons";

export type EventPropsType = {
    notificationContext?: NotificationContextType,
} & RouteComponentProps<{
    id: string
}>

export type EventStateType = {
    id?: string,
    event?: GatewayEvent,
    changelog?: EventChange,
    entsStates?: EntsStatus[],
    buildingStates?: EventState[],
    files?: GatewayFile[],
    venues?: string[],
};

class Event extends React.Component<EventPropsType, EventStateType> {

    static displayName = "Event";


    constructor(props: Readonly<EventPropsType>) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
        }
    }

    private failedLoad = (reason: string) => {
        if (this.props.notificationContext) {
            try {
                this.props.notificationContext.showNotification(
                    'Failed to Load',
                    `There was an error: ${reason}`,
                    faSkullCrossbones,
                    Theme.FAILURE
                )
                console.log('Notification shown');
            } catch (e) {
                console.error('Notification system failed to send');
            }
        }
    }

    componentDidMount() {
        Axios.get(
            urljoin(
                Config.BASE_GATEWAY_URI,
                'events',
                encodeURIComponent(this.props.match.params.id),
            )
        ).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                event: data.data.event,

                // Changelog is provided on the /event/{id} endpoint but no where else (not on patch)
                changelog: data.data.changelog,
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
                'files',
            )
        ).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                files: data.data.files,
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
                venues: data.data,
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
                entsStates: data.data,
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
                buildingStates: data.data,
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

    private patchEvent = (changeProps: Partial<GatewayEvent>) => {
        if (!this.state.event) return;

        const changed: any = {
            ...changeProps,
        };

        // TODO: provide transform functions for turning partial events into patch instructions
        if (changeProps.bookingStart instanceof Date) changed.bookingStart = changeProps.bookingStart.getTime();
        if (changeProps.bookingEnd instanceof Date) changed.bookingEnd = changeProps.bookingEnd.getTime();

        Axios.patch(
            url.resolve(
                Config.BASE_GATEWAY_URI,
                '/event/' + encodeURIComponent(this.state.event._id)
            ),
            changed,
            {
                headers: {
                    Accepts: 'application/json'
                }
            }
        ).then((data) => {
            this.setState((oldState) => ({
                ...oldState,
                event: data.data
            }));
        }).catch((err) => {
            // TODO: figure out how to raise errors!
            console.error(err);
        })
    }

    private changeStartTime = (date: Date) => {
        this.patchEvent({
            bookingStart: date,
        });
    }

    private changeEndTime = (date: Date) => {
        this.patchEvent({
            bookingEnd: date,
        });
    }

    private changeProperty(property: keyof GatewayEvent) {
        return (e: any) => {
            const changes: Partial<GatewayEvent> = {};

            changes[property] = e;

            this.patchEvent(changes);
        }
    }

    private generateEditableProperty = (
        options: string[] | { key: string, value: string }[] | undefined,
        name: string, selected: string | undefined,
        property: keyof GatewayEvent,
    ) => {
        return options
            ? (
                <EditableProperty
                    name={name}
                    config={{
                        options,
                        type: 'select',
                        onChange: this.changeProperty(property),
                    }}
                >
                    <div className="value">{selected ? selected : 'Not set'}</div>
                </EditableProperty>
            ) : (
                <div>
                    <div className="value">{selected ? selected : 'Not set'}</div>
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
                            <ReactTimeAgo date={this.state.event.bookingStart} />
                            </span>
                        </div>
                        <div className="property updates">
                            <span className="label">Updates</span>
                            <span className="value">20</span>
                        </div>
                    </div>
                    {/*TODO: add file loading*/}
                    {
                        this.state.files
                            ? (<FileList files={this.state.files} />)
                            : undefined
                    }
                    {/*<FileList files={[*/}
                    {/*    {*/}
                    {/*        private: false,*/}
                    {/*        size: 1000,*/}
                    {/*        filename: 'Some file.txt',*/}
                    {/*        name: 'Rider',*/}
                    {/*        author: {*/}
                    {/*            username: 'ryan',*/}
                    {/*            name: 'Ryan Delaney',*/}
                    {/*        },*/}
                    {/*        created: new Date().getTime(),*/}
                    {/*        downloadURL: '/files/x',*/}
                    {/*        id: 'abcd'*/}
                    {/*    },*/}
                    {/*    {*/}
                    {/*        private: true,*/}
                    {/*        size: 1000,*/}
                    {/*        filename: 'Some file.txt',*/}
                    {/*        name: 'Rider',*/}
                    {/*        author: {*/}
                    {/*            username: 'ryan',*/}
                    {/*            name: 'Ryan Delaney',*/}
                    {/*        },*/}
                    {/*        created: new Date().getTime(),*/}
                    {/*        downloadURL: '/files/x',*/}
                    {/*        id: 'abcd'*/}
                    {/*    },*/}
                    {/*]} />*/}
                    <CommentList comments={[]} />
                </div>
                <div className="rightbar-real">
                    <div className="entry">
                        <div className="title">Venue</div>
                        {this.generateEditableProperty(
                            this.state.venues,
                            'Venue',
                            this.state.event.venue,
                            'venue'
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Ents State</div>
                        {this.generateEditableProperty(
                            this.state.entsStates
                                ? this.state.entsStates.map((e) => e.name)
                                : undefined,
                            'Ents State',
                            this.state.event.entsStatus
                                ? this.state.event.entsStatus.name
                                : undefined,
                            'entsStatus'
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Building Status</div>
                        {this.generateEditableProperty(
                            this.state.buildingStates
                                ? this.state.buildingStates.map((e) => e.state)
                                : undefined,
                            'Building State',
                            this.state.event.state
                                ? this.state.event.state.state
                                : undefined,
                            'state'
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
                                    name={'Booking Start'}
                                    config={{
                                        type: 'date',
                                        value: this.state.event.bookingStart,
                                        onChange: this.changeStartTime,
                                    }}
                                >
                                    {moment(this.state.event.bookingStart).format('dddd Do MMMM (YYYY), HH:mm')}
                                </EditableProperty>
                            </div>
                            <div className="bar" />
                            <div className="duration">
                                {moment.duration(moment(this.state.event.bookingStart).diff(moment(this.state.event.bookingEnd))).humanize()}
                            </div>
                            <div className="bar" />
                            <div className="label">
                                Booking End
                            </div>
                            <div className="time">
                                <EditableProperty
                                    name={'Booking End'}
                                    config={{
                                        type: 'date',
                                        value: this.state.event.bookingEnd,
                                        onChange: this.changeEndTime,
                                    }}
                                >
                                    {moment(this.state.event.bookingEnd).format('dddd Do MMMM (YYYY), HH:mm')}
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

};

// @ts-ignore
export default withRouter(withNotificationContext(Event));
