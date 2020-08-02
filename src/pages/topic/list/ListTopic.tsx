import React from 'react';
import { API, TopicResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';

export type ListTopicPropsType = {};

export type ListTopicStateType = {
    topics?: TopicResponse[],
};

export class ListTopic extends React.Component<ListTopicPropsType, ListTopicStateType> {

    static displayName = 'ListTopic';

    constructor(props: Readonly<ListTopicPropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.topics.get().then((data) => failEarlyStateSet(this.state, this.setState.bind(this), 'topics')(data.result))
            .catch((err) => console.error(err));
    }

    render() {
        if (!this.state.topics) return null;

        const topics: GenericRecord<TopicResponse>[] = this.state.topics.map((e) => ({
            identifier: e.id,
            target: `/topics/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-topics" style={{padding: '30px'}}>
                <h1>Topics</h1>
                <GenericList
                    records={topics}
                    dontPad
                    render={genericRender<TopicResponse>()}
                />
            </div>
        );
    }
}
