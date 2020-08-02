import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, TopicResponse, TopicUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';

export type ViewTopicPropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewTopicStateType = {
    topic?: TopicResponse,
};

class ViewTopicClass extends React.Component<ViewTopicPropsType, ViewTopicStateType> {

    static displayName = 'ViewTopic';

    constructor(props: Readonly<ViewTopicPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        API.topics.id.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'topic',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
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

    render() {
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
                            content: 'This is an example comment',
                            topic: this.state.topic,
                            posted: new Date().getTime() / 1000,
                            id: 'fakeid',
                            poster: {
                                name: 'Dave Example',
                                id: 'fakeid',
                                username: 'dexmp',
                                profile: 'https://placehold.it/200/F0F0F0',
                            },
                        },
                    ]}
                />
            );
        }
        return null;
    }

}

export const ViewTopic = withRouter(ViewTopicClass);
