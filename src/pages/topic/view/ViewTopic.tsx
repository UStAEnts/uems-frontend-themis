import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, TopicResponse, TopicUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";

export type ViewTopicPropsType = {} & RouteComponentProps<{
    id: string,
}> & NotificationPropsType;

export type ViewTopicStateType = {
    topic?: TopicResponse,
} & FallibleReactStateType;

class ViewTopicClass extends FallibleReactComponent<ViewTopicPropsType, ViewTopicStateType> {

    static displayName = 'ViewTopic';

    constructor(props: Readonly<ViewTopicPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ViewTopicStateType>(
            [{
                call: API.topics.id.get,
                stateName: 'topic',
                params: [this.props.match.params.id],
            }],
            this.setState.bind(this),
            () => UIUtilities.tryShowPartialWarning(this),
        );
    }

    private patch = (update: TopicUpdate) => {
        API.topics.id.patch(this.props.match.params.id, update).then(() => {
            // To fix some typing
            if (!this.state.topic) return;

            const newVenue: TopicResponse = {
                ...this.state.topic,
                ...update,
            };

            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'topic',
            )(newVenue);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
    }

    realRender() {
        if (this.state.topic) {
            return (
                <EventOrCommentRelatedView
                    obj={this.state.topic}
                    patch={(changes: TopicUpdate) => this.patch(changes)}
                    excluded={['id']}
                    configOverrides={[
                        {
                            property: 'description',
                            type: 'textarea',
                        },
                    ]}
                    comments={[
                        {
                            body: 'This is an example comment',
                            topic: this.state.topic,
                            posted: new Date().getTime() / 1000,
                            // TODO: get from UI
                            requiresAttention: false,
                            id: 'fakeid',
                            poster: {
                                name: 'Dave Example',
                                id: 'fakeid',
                                username: 'dexmp',
                                profile: '/default-icon.png',
                            },
                        },
                    ]}
                    delete={{
                        redirect: '/topics',
                        onDelete: () => UIUtilities.deleteWith409Support(() => API.topics.id.delete(this.props.match.params.id)),
                    }}
                />
            );
        }
        return null;
    }

}

export const ViewTopic = withNotificationContext(withRouter(ViewTopicClass));
