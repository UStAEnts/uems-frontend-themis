import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import apiInstance, {
	PATCHTopicsIdBody,
	Topic,
} from '../../../utilities/APIPackageGen';

export type ViewTopicPropsType = {} & RouteComponentProps<{
	id: string;
}> &
	NotificationPropsType;

export type ViewTopicStateType = {
	topic?: Topic;
} & FallibleReactStateType;

class ViewTopicClass extends FallibleReactComponent<
	ViewTopicPropsType,
	ViewTopicStateType
> {
	static displayName = 'ViewTopic';

	constructor(props: Readonly<ViewTopicPropsType>) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		loadAPIData<ViewTopicStateType>(
			[
				{
					call: apiInstance.topics().id(this.props.match.params.id).get,
					stateName: 'topic',
					params: [],
				},
			],
			this.setState.bind(this),
			() => UIUtilities.tryShowPartialWarning(this)
		);
	}

	private patch = (update: PATCHTopicsIdBody) => {
		UIUtilities.load(
			this.props,
			apiInstance.topics().id(this.props.match.params.id).patch(update),
			(e) => `Failed to update your topic! ${e}`
		).data(() => {
			// To fix some typing
			if (!this.state.topic) return;

			const newVenue: Topic = {
				...this.state.topic,
				...update,
			};

			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'topic'
			)(newVenue);
		});
	};

	realRender() {
		if (this.state.topic) {
			return (
				<EventOrCommentRelatedView
					obj={this.state.topic}
					patch={(changes: PATCHTopicsIdBody) => this.patch(changes)}
					excluded={['id']}
					configOverrides={[
						{
							property: 'description',
							type: 'textarea',
						},
					]}
					comments={
						[
							// {
							// 	body: 'This is an example comment',
							// 	topic: this.state.topic,
							// 	posted: new Date().getTime() / 1000,
							// 	// TODO: get from UI
							// 	requiresAttention: false,
							// 	id: 'fakeid',
							// 	poster: {
							// 		name: 'Dave Example',
							// 		id: 'fakeid',
							// 		username: 'dexmp',
							// 		profile: '/default-icon.png',
							// 	},
							// 	attendedDate: undefined,
							// 	assetType: 'topic',
							// 	assetID: this.props.match.params.id,
							// },
						]
					}
					delete={{
						redirect: '/topics',
						onDelete: () =>
							UIUtilities.deleteWith409Support(() =>
								apiInstance.topics().id(this.props.match.params.id).delete()
							),
					}}
				/>
			);
		}
		return null;
	}
}

export const ViewTopic = withNotificationContext(withRouter(ViewTopicClass));
