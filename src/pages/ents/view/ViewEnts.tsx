import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EntsStateResponse, EntsStateUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';

export type ViewEntsPropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewEntsStateType = {
    ents?: EntsStateResponse,
};

class ViewEntsClass extends React.Component<ViewEntsPropsType, ViewEntsStateType> {

    static displayName = 'ViewEnts';

    constructor(props: Readonly<ViewEntsPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        API.ents.id.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'ents',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
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

    render() {
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
                        onDelete: async () => {
                            try {
                                await API.ents.id.delete(this.props.match.params.id);
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

export const ViewEnts = withRouter(ViewEntsClass);
