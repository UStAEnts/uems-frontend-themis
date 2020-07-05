import { GatewayEvent } from "../../types/Event";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import Loader from "react-loader-spinner";
import { Theme } from "../../theme/Theme";

import './Event.scss';
import moment from "moment";
import { CommentBox } from "../../components/atoms/comment-box/CommentBox";

export type EventPropsType = {} & RouteComponentProps<{
    id: string,
}>

export type EventStateType = {
    id?: string,
    event?: GatewayEvent,
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
        }, 500);
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
                        <div className="value">{this.state.event.venue}</div>
                    </div>
                    <div className="entry">
                        <div className="title">Ents State</div>
                        <div className="value">{String(this.state.event.entsStatus)}</div>
                    </div>
                    <div className="entry">
                        <div className="title">Building Status</div>
                        <div className="value">{String(this.state.event.state)}</div>
                    </div>
                    <div className="entry">
                        <div className="title">Timing</div>
                        <div className="value">
                            <div className="begin">Begin:</div>

                            <div
                                className="time"
                            >
                                {moment(this.state.event.bookingStart).format('dddd Do MMMM (YYYY), HH:mm')}
                            </div>

                            <div
                                className="begin"
                            >
                                Ends:
                            </div>

                            <div
                                className="time"
                            >
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
