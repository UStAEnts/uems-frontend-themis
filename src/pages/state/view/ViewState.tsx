import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EventResponse, StateResponse, StateUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';

export type ViewStatePropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewStateStateType = {
    state?: StateResponse,
    events?: EventResponse[],
};

class ViewStateClass extends React.Component<ViewStatePropsType, ViewStateStateType> {

    static displayName = 'ViewState';

    constructor(props: Readonly<ViewStatePropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        API.states.id.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'state',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
        API.states.id.events.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'events',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
    }

    //
    private patch = (update: StateUpdate) => {
        console.log(update);
        API.states.id.patch(this.props.match.params.id, update).then(() => {
            // To fix some typing
            if (!this.state.state) return;

            const newState: StateResponse = {
                ...this.state.state,
                ...update,
            };

            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'state',
            )(newState);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
    }

    render() {
        if (this.state.state) {
            return (
                <EventOrCommentRelatedView
                    obj={this.state.state}
                    patch={(changes: StateUpdate) => {
                        this.patch(changes);
                    }}
                    excluded={[
                        'id',
                    ]}
                    events={this.state.events}
                    delete={{
                        redirect: '/states',
                        onDelete: async () => {
                            try {
                                await API.states.id.delete(this.props.match.params.id);
                                return true;
                            } catch (e) {
                                return false;
                            }
                        },
                    }}
                />
            );
        }
        return null;
    }
}

export const ViewState = withRouter(ViewStateClass);
