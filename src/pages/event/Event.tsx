import { EntsStatus, EventState, GatewayEvent } from "../../types/Event";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import Loader from "react-loader-spinner";
import { Theme } from "../../theme/Theme";

import './Event.scss';
import moment from "moment";
import { CommentBox } from "../../components/atoms/comment-box/CommentBox";
import { EditableProperty } from "../../components/components/editable-property/EditableProperty";

export type EventPropsType = {} & RouteComponentProps<{
    id: string
}>

export type EventStateType = {
    id?: string,
    event?: GatewayEvent,
    entsStates?: EntsStatus[],
    buildingStates?: EventState[],
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

    componentDidMount() {
        // Pretend this is done via axios!
        setTimeout(() => {
            this.setState((oldState) => ({
                ...oldState,
                event: {
                    _id: oldState.id,
                    attendance: 300,
                    bookingEnd: moment().add(7, 'hours').toDate(),
                    bookingStart: moment().add(1, 'hour').toDate(),
                    name: 'Some Event',
                    venue: 'StAge',
                } as GatewayEvent,
            }))

            setTimeout(() => {
                this.setState((oldState) => ({
                    ...oldState,
                    venues: ['StAge', '601', 'Stage and 601'],
                    entsStates: [
                        { name: 'ready' },
                        { name: 'signup' },
                        { name: 'awaiting requirements' },
                    ],
                    buildingStates: [
                        { state: 'ready' },
                        { state: 'approved' },
                        { state: 'cancelled' },
                    ]
                }));
            }, 1000);
        }, 500);
    }

    private static generateEditableProperty(options: string[] | { key: string, value: string }[] | undefined, name: string, selected: string | undefined) {
        return options
            ? (
                <EditableProperty
                    name={name}
                    options={options}
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
        console.log(this.props.match.params);
        return this.state.event ? (
            <div className="event-view loaded">
                <div className="real">
                    <h1>{this.state.event.name}</h1>
                    <CommentBox
                        poster={{
                            name: 'idk',
                            username: 'state_management_is_hard',
                        }}
                        submitCommentHandler={() => false}
                        contentClasses={[]}
                    />
                </div>
                <div className="rightbar-real">
                    <div className="entry">
                        <div className="title">Venue</div>
                        {Event.generateEditableProperty(
                            this.state.venues,
                            'Venue',
                            this.state.event.venue,
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Ents State</div>
                        {Event.generateEditableProperty(
                            this.state.entsStates
                                ? this.state.entsStates.map((e) => e.name)
                                : undefined,
                            'Ents State',
                            this.state.event.entsStatus
                                ? this.state.event.entsStatus.name
                                : undefined,
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Building Status</div>
                        {Event.generateEditableProperty(
                            this.state.buildingStates
                                ? this.state.buildingStates.map((e) => e.state)
                                : undefined,
                            'Building State',
                            this.state.event.state
                                ? this.state.event.state.state
                                : undefined,
                        )}
                    </div>
                    <div className="entry">
                        <div className="title">Timing</div>
                        <div className="value flow">
                            <div className="label">
                                Booking Start
                            </div>
                            <div className="time">
                                {moment(this.state.event.bookingStart).format('dddd Do MMMM (YYYY), HH:mm')}
                            </div>
                            <div className="bar" />
                            <div className="label">
                                Event Start
                            </div>
                            <div className="time">
                                {moment(this.state.event.bookingStart).format('dddd Do MMMM (YYYY), HH:mm')}
                            </div>
                            <div className="bar" />
                            <div className="duration">
                                {moment.duration(moment(this.state.event.bookingStart).diff(moment(this.state.event.bookingEnd))).humanize()}
                            </div>
                            <div className="bar" />
                            <div className="label">
                                Event End
                            </div>
                            <div className="time">
                                {moment(this.state.event.bookingStart).format('dddd Do MMMM (YYYY), HH:mm')}
                            </div>
                            <div className="bar" />
                            <div className="label">
                                Booking End
                            </div>
                            <div className="time">
                                {moment(this.state.event.bookingEnd).format('dddd Do MMMM (YYYY), HH:mm')}
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

export default withRouter(Event);
