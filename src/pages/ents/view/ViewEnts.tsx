import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EntsStateResponse, EntsStateUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import { loadAPIData } from "../../../utilities/DataUtilities";
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";
import {UIUtilities} from "../../../utilities/UIUtilities";

export type ViewEntsPropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewEntsStateType = {
    ents?: EntsStateResponse,
} & FallibleReactStateType;

class ViewEntsClass extends FallibleReactComponent<ViewEntsPropsType, ViewEntsStateType> {

    static displayName = 'ViewEnts';

    constructor(props: Readonly<ViewEntsPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ViewEntsStateType>([{
            params: [this.props.match.params.id],
            stateName: 'ents',
            call: API.ents.id.get,
        }], this.setState.bind(this));
    }

    //
    private patch = (update: EntsStateUpdate) => {
        console.log(update);
        API.ents.id.patch(this.props.match.params.id, update).then(() => {
            // To fix some typing
            if (!this.state.ents) return;

            const newEnts: EntsStateResponse = {
                ...this.state.ents,
                ...update,
            };

            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'ents',
            )(newEnts);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
    }

    realRender() {
        if (this.state.ents) {
            return (
                <EventOrCommentRelatedView
                    obj={this.state.ents}
                    patch={(changes: EntsStateUpdate) => {
                        this.patch(changes);
                    }}
                    configOverrides={[
                        {
                            property: 'color',
                            type: 'color',
                        },
                    ]}
                    excluded={[
                        'id',
                    ]}
                    delete={{
                        redirect: '/ents',
                        onDelete: () => UIUtilities.deleteWith409Support(API.ents.id.delete, this.props.match.params.id),
                    }}
                />
            );
        }
        return null;
    }
}

export const ViewEnts = withRouter(ViewEntsClass);
