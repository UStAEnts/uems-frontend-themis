import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EventResponse, StateResponse, StateUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {UIUtilities} from "../../../utilities/UIUtilities";

export type ViewStatePropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewStateStateType = {
    state?: StateResponse,
    events?: EventResponse[],
};

type ExperimentalStateType = ViewStateStateType & FallibleReactStateType;

class ExperimentalViewStateClass extends FallibleReactComponent<ViewStatePropsType, ExperimentalStateType> {

    constructor(props: ViewStatePropsType) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ExperimentalStateType>(
            [
                {
                    call: API.states.id.get,
                    stateName: 'state',
                    params: [this.props.match.params.id],
                },
                {
                    call: API.states.id.events.get,
                    stateName: 'events',
                    params: [this.props.match.params.id],
                },
            ],
            this.setState.bind(this),
        );
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

    realRender(): React.ReactNode {
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
                        onDelete: () => UIUtilities.deleteWith409Support(() => API.states.id.delete(this.props.match.params.id)),
                    }}
                />
            );
        }
        return null;
    }

}

export const ViewState = withRouter(ExperimentalViewStateClass);
