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
	EventList,
	State,
} from '../../../utilities/APIPackageGen';

export type ViewStatePropsType = {} & RouteComponentProps<{
	id: string;
}> &
	NotificationPropsType;

export type ViewStateStateType = {
	state?: State;
	events?: EventList;
};

type ExperimentalStateType = ViewStateStateType & FallibleReactStateType;

class ExperimentalViewStateClass extends FallibleReactComponent<
	ViewStatePropsType,
	ExperimentalStateType
> {
	constructor(props: ViewStatePropsType) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		loadAPIData<ExperimentalStateType>(
			[
				{
					call: apiInstance.states().id(this.props.match.params.id).get,
					stateName: 'state',
					params: [],
				},
				{
					call: apiInstance.states().id(this.props.match.params.id).events()
						.get,
					stateName: 'events',
					params: [],
				},
			],
			this.setState.bind(this),
			() => UIUtilities.tryShowPartialWarning(this)
		);
	}

	//
	private patch = (update: State) => {
		console.log(update);
		UIUtilities.load(
			this.props,
			apiInstance.states().id(this.props.match.params.id).patch(update),
			(e) => `Failed to update this state! ${e}`
		).data(() => {
			// To fix some typing
			if (!this.state.state) return;

			const newState: State = {
				...this.state.state,
				...update,
			};

			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'state'
			)(newState);
		});
	};

	realRender(): React.ReactNode {
		if (this.state.state) {
			return (
				<EventOrCommentRelatedView
					obj={this.state.state}
					patch={(changes: State) => {
						this.patch(changes);
					}}
					excluded={['id']}
					events={this.state.events}
					delete={{
						redirect: '/states',
						onDelete: () =>
							UIUtilities.deleteWith409Support(() =>
								apiInstance.states().id(this.props.match.params.id).delete()
							),
					}}
				/>
			);
		}
		return null;
	}
}

export const ViewState = withNotificationContext(
	withRouter(ExperimentalViewStateClass)
);
