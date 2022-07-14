import React from 'react';
import {
	GenericList,
	GenericRecord,
	genericRender,
} from '../../../components/components/generic-list/GenericList';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import apiInstance, { Topic } from '../../../utilities/APIPackageGen';

export type ListTopicPropsType = {} & NotificationPropsType;

export type ListTopicStateType = {
	topics?: Topic[];
} & FallibleReactStateType;

class ListTopicClass extends FallibleReactComponent<
	ListTopicPropsType,
	ListTopicStateType
> {
	static displayName = 'ListTopic';

	constructor(props: Readonly<ListTopicPropsType>) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		loadAPIData<ListTopicStateType>(
			[
				{
					call: apiInstance.topics().get,
					stateName: 'topics',
					params: [{}],
				},
			],
			this.setState.bind(this),
			() => UIUtilities.tryShowPartialWarning(this)
		);
	}

	realRender() {
		if (!this.state.topics) return null;

		const topics: GenericRecord<Topic>[] = this.state.topics.map((e) => ({
			identifier: e.id,
			target: `/topics/${e.id}`,
			value: e,
		}));

		return (
			<div className="list-topics" style={{ padding: '30px' }}>
				<h1>Topics</h1>
				<GenericList records={topics} dontPad render={genericRender<Topic>()} />
			</div>
		);
	}
}

export const ListTopic = withNotificationContext(ListTopicClass);
