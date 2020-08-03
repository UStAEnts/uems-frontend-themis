import React from 'react';
import { API, TopicResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";
import { loadAPIData } from "../../../utilities/DataUtilities";
import { ViewTopicStateType } from "../view/ViewTopic";

export type ListTopicPropsType = {};

export type ListTopicStateType = {
    topics?: TopicResponse[],
} & FallibleReactStateType;

export class ListTopic extends FallibleReactComponent<ListTopicPropsType, ListTopicStateType> {

    static displayName = 'ListTopic';

    constructor(props: Readonly<ListTopicPropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListTopicStateType>(
            [{
                call: API.topics.get,
                stateName: 'topics',
                params: [],
            }],
            this.setState.bind(this),
        );
    }

    realRender() {
        if (!this.state.topics) return null;

        const topics: GenericRecord<TopicResponse>[] = this.state.topics.map((e) => ({
            identifier: e.id,
            target: `/topics/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-topics" style={{ padding: '30px' }}>
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
