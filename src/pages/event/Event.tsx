import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Loader from 'react-loader-spinner';

import './Event.scss';
import moment from 'moment';
import Axios from 'axios';
import ReactTimeAgo from 'react-time-ago';
import urljoin from 'url-join';
import { faFileCode, faSkullCrossbones, faTimes } from '@fortawesome/free-solid-svg-icons';
import { withNotificationContext } from '../../components/WithNotificationContext';
import { NotificationContextType } from '../../context/NotificationContext';
import { FileList } from '../../components/atoms/file-bar/FileBar';
import { CommentList } from '../../components/components/comment-list/CommentList';
import Config from '../../config/Config';
import { EditableProperty } from '../../components/components/editable-property/EditableProperty';
import { Theme } from '../../theme/Theme';
import { KeyValueOption, Select } from '../../components/atoms/select/Select';
import {
    API,
    CommentResponse, EntsStateResponse,
    EventPropertyChangeResponse,
    EventResponse, EventUpdate,
    FileResponse, SignupResponse, StateResponse, TopicResponse, User,
    VenueResponse
} from "../../utilities/APIGen";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../components/atoms/button/Button";
import { GlobalContext } from "../../context/GlobalContext";

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
    topics?: TopicResponse[],
    /**
     * The venues that this event could take place in
     */
    venues?: VenueResponse[],
    /**
     * All users signed on to this event and their roles
     */
    signups?: SignupResponse[],

    chosenRole?: string,
};

class Event extends React.Component<EventPropsType, EventStateType> {

    static displayName = 'Event';

    static contextType = GlobalContext;

    constructor(props: Readonly<EventPropsType>) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
            chosenRole: 'Other',
        };
    }

    /**
     * When the components mount, we need to query the API for the actual properties we need
     */
    componentDidMount() {
        API.events.id.get(this.props.match.params.id).then((data) => {
            // TODO: add schema validation for data returned by the server
            this.setState((oldState) => ({
                ...oldState,
                event: data.result.event,

                // Changelog is provided on the /event/{id} endpoint but no where else (not on patch)
                changelog: data.result.changelog,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load event: ${err.message}`);
        });

        API.topics.get().then((data) => {
            this.setState((oldState) => ({
                ...oldState,
                topics: data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load topic data');
            console.error(err);

            this.failedLoad(`Could not load topic list: ${err.message}`);
        });

        API.events.id.signups.get(this.props.match.params.id).then((data) => {
            this.setState((oldState) => ({
                ...oldState,
                signups: data.result,
            }));
        }).catch((err) => {
            console.error('Failed to load event data');
            console.error(err);

            this.failedLoad(`Could not load signups: ${err.message}`);
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

        const filtered: Partial<EventResponse> = Object.fromEntries(
            Object.entries(changeProps).filter(([, value]) => value !== undefined),
        );
        if (Object.prototype.hasOwnProperty.call(filtered, 'ents')) {
            filtered.ents = this.state.entsStates?.find((e) => e.id === changeProps.ents);
        }
        if (Object.prototype.hasOwnProperty.call(filtered, 'state')) {
            filtered.state = this.state.buildingStates?.find((e) => {
                console.log(e.id, changeProps.state, e.id === changeProps.state);
                return e.id === changeProps.state
            });
        }
        if (Object.prototype.hasOwnProperty.call(filtered, 'venue')) {
            filtered.venue = this.state.venues?.find((e) => e.id === changeProps.venue);
        }
        const updatedEvent: EventResponse = { ...this.state.event, ...filtered };

        API.events.id.patch(this.state.event.id, changeProps).then(() => {
            // The response only contains an ID so we need to spread the updated parameters on top of the existing ones
            this.setState((oldState) => ({
                ...oldState,
                event: updatedEvent,
            }));
        }).catch((err) => {
            // TODO: figure out how to raise errors and display them properly!
            console.error(err);
            this.failedLoad('Could not save the event!');
        });
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

    private changeSelectedRole = (role: string) => {
        this.setState((oldState) => ({
            ...oldState,
            chosenRole: role,
        }));
    }

    private signup = () => {
        if (this.state.chosenRole === undefined || this.state.event === undefined) return;

        API.events.id.signups.post(this.state.event.id, {
            role: this.state.chosenRole,
            userID: this.context.user.id,
        }).then((id) => {
            this.setState((oldState) => ({
                signups: [{
                    userID: this.context.user.id,
                    role: oldState.chosenRole,
                    date: new Date().getTime() / 1000,
                    id: id.result.id,
                    user: this.context.user,
                }, ...(oldState.signups ?? [])],
            }));
        }).catch((err) => {
            if (this.props.notificationContext) {
                this.props.notificationContext.showNotification(
                    'Could not signup signup',
                    `Failed to add: ${err.message}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
            }
        });
    }

    private removeSignup = (id: string) => {
        if (this.state.event === undefined) return;

        API.events.id.signups.id.delete(this.state.event.id, id).then(() => {
            this.setState((oldState) => ({
                signups: (oldState.signups ?? []).filter((e) => e.id !== id),
            }));
        }).catch((err) => {
            if (this.props.notificationContext) {
                this.props.notificationContext.showNotification(
                    'Could not remove signup',
                    `Failed to remove: ${err.message}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
            }
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
        name: string,
        selected: string | undefined,
        property: keyof EventUpdate,
    ) => (
        options ? (
            <EditableProperty
                name={name}
                config={{
                    options,
                    type: 'select',
                    // TODO: dangerous?
                    onChange: (x: string | KeyValueOption) => this.changeProperty(property)(
                        typeof x === 'string' ? x : x.additional.id,
                    ),
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

    private groupSignups = () => {
        if (this.state.signups === undefined) return {};

        const result: { [key: string]: SignupResponse[] } = {};

        for (const signup of this.state.signups) {
            if (Object.prototype.hasOwnProperty.call(result, signup.role ?? 'Unassigned')) {
                result[signup.role ?? 'Unassigned'].push(signup);
            } else {
                result[signup.role ?? 'Unassigned'] = [signup];
            }
        }

        return result;
    }

    private makeSignupComponent = (signupID: string, user: User) => (
        <div key={`signup.${user.id}.${signupID}`} className="signup">
            <Link className="user" to={`/users/${user.id}`}>
                <div className="profile">
                    <img alt={`Profile for ${user.name}`} src={user.profile ?? 'https://placehold.it/200'} />
                </div>
                <div className="name">{user.name}</div>
            </Link>
            <div className="spacer" />
            {/* TODO: FIGURE OUT PERMISSIONS SO THIS IS NOT AVAILABLE TO EVERYONE */}
            <div className="remove">
                <FontAwesomeIcon
                    icon={faTimes}
                    onClick={() => this.removeSignup(signupID)}
                />
            </div>
        </div>
    );

    private sendComment = (comment: string, topicID: string) => {
        if (this.state.event === undefined) return;

        API.events.id.comments.post(this.state.event.id, {
            content: comment,
            topic: topicID,
        }).then((id) => {
            this.setState((old) => ({
                ...old,
                comments: [{
                    id: id.result.id,
                    content: comment,
                    posted: new Date().getTime() / 1000,
                    poster: this.context.user,
                    topic: (old.topics ?? []).find((e) => e.id === topicID),
                }, ...(old.comments ?? [])],
            }));
        }).catch((e) => {
            if (this.props.notificationContext) {
                this.props.notificationContext.showNotification(
                    'Could not send comment',
                    `Failed to submit your comment! ${e.message}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
            }
        });
    }

    private changeProperty(property: keyof EventUpdate) {
        return (e: any) => {
            const changes: EventUpdate = {};

            changes[property] = e;

            this.patchEvent(changes);
        };
    }

    private renderSignups = () => {
        const grouped = this.groupSignups();

        return Object.entries(grouped).map(
            (([name, signups]) => ([
                (<div key={`role.${name}`} className="role">{name}</div>),
                ...signups.map((e) => this.makeSignupComponent(e.id, e.user)),
            ])),
        ).flat();
    }

    render() {
        return this.state.event ? (
            <div className="event-view loaded">
                <div className="real">
                    <EditableProperty
                        name="name"
                        config={{
                            value: this.state.event.name,
                            type: 'text',
                            onChange: (name: string) => this.patchEvent({
                                name,
                            }),
                        }}
                    >
                        <h1 style={{ display: 'inline-block' }}>{this.state.event.name}</h1>
                    </EditableProperty>
                    <div className="properties-bar">
                        <div className="property creation">
                            <span className="label">Created</span>
                            <span className="value">
                                <ReactTimeAgo date={this.state.event.startDate * 1000} />
                            </span>
                        </div>
                        <div className="property updates">
                            <span className="label">Updates</span>
                            <span className="value">
                                {(this.state.comments ?? []).length + (this.state.changelog ?? []).length}
                            </span>
                        </div>
                    </div>
                    {/* TODO: add file loading */}
                    {
                        this.state.files
                            ? (<FileList files={this.state.files} />)
                            : undefined
                    }
                    <Button
                        color={Theme.GREEN}
                        text="Attach new file"
                        icon={faFileCode}
                    />
                    {
                        this.state.comments
                            ? (
                                <CommentList
                                    comments={this.state.comments}
                                    updates={this.state.changelog}
                                    topics={this.state.topics ?? []}
                                    onCommentSent={this.sendComment}
                                />
                            )
                            : undefined
                    }
                </div>
                <div className="rightbar-real">
                    <div className="entry">
                        <div className="title">Venue</div>
                        {this.generateEditableProperty(
                            this.state.venues?.map((e: VenueResponse) => ({
                                text: e.name,
                                value: e.id,
                                additional: e,
                            })),
                            'Venue',
                            this.state.event.venue?.name,
                            'venue',
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Projected Attendance</div>
                        <EditableProperty
                            name="attendance"
                            config={{
                                type: 'text',
                                onChange: this.changeProperty('attendance'),
                                fieldType: 'number',
                                value: this.state.event.attendance,
                            }}
                        >
                            {this.state.event.attendance}
                        </EditableProperty>
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
                                        value: new Date(this.state.event.startDate * 1000),
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
                                        value: new Date(this.state.event.endDate * 1000),
                                        onChange: this.changeEndTime,
                                    }}
                                >
                                    {moment.unix(this.state.event.endDate).format('dddd Do MMMM (YYYY), HH:mm')}
                                </EditableProperty>
                            </div>
                        </div>
                    </div>

                    <div className="entry">
                        <div className="title">Signups</div>
                        <div className="signup-list">
                            {this.renderSignups()}
                        </div>
                        <div className="title">Join</div>
                        <Select
                            placeholder="Role"
                            name="role"
                            options={[
                                'Lighting (LX)',
                                'Sound (S)',
                                'Video / Projections (V)',
                                'Stage Manager (SM)',
                                'Event Manager (EM)',
                                'General Tech (AV)',
                                'Operator (OP)',
                                'Shadow',
                                'Other',
                            ]}
                            initialOption={this.state.chosenRole}
                            onSelectListener={this.changeSelectedRole}
                        />
                        <Button
                            color={Theme.PURPLE_LIGHT}
                            onClick={this.signup}
                            text="Signup"
                        />
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
