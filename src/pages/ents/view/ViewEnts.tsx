import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import apiInstance, {
	EntState,
	EventList,
} from '../../../utilities/APIPackageGen';

export type ViewEntsPropsType = {} & RouteComponentProps<{
	id: string;
}> &
	NotificationPropsType;

export type ViewEntsStateType = {
	ents?: EntState;
	events?: EventList;
} & FallibleReactStateType;

class ViewEntsClass extends FallibleReactComponent<
	ViewEntsPropsType,
	ViewEntsStateType
> {
	static displayName = 'ViewEnts';

	constructor(props: Readonly<ViewEntsPropsType>) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		loadAPIData<ViewEntsStateType>(
			[
				{
					params: [],
					stateName: 'ents',
					call: () => apiInstance.ents().id(this.props.match.params.id).get(),
				},
				{
					call: apiInstance.events().get,
					stateName: 'events',
					params: [
						{
							entsID: this.props.match.params.id,
						},
					],
				},
			],
			this.setState.bind(this),
			() => UIUtilities.tryShowPartialWarning(this)
		);
	}

	//
	private patch = (update: EntState) => {
		console.log(update);
		apiInstance
			.ents()
			.id(this.props.match.params.id)
			.patch(update)
			.then(() => {
				// To fix some typing
				if (!this.state.ents) return;

				const newEnts: EntState = {
					...this.state.ents,
					...update,
				};

				failEarlyStateSet(
					this.state,
					this.setState.bind(this),
					'ents'
				)(newEnts);
			})
			.catch((err) => {
				console.error(err);
				// TODO: error handling w/ notifs
			});
	};

	realRender() {
		if (this.state.ents) {
			return (
				<EventOrCommentRelatedView
					obj={this.state.ents}
					patch={(changes: EntState) => {
						this.patch(changes);
					}}
					events={this.state.events}
					configOverrides={[
						{
							property: 'color',
							type: 'color',
						},
					]}
					excluded={['id']}
					delete={{
						redirect: '/ents',
						onDelete: () =>
							UIUtilities.deleteWith409Support(() =>
								apiInstance.ents().id(this.props.match.params.id).delete()
							),
					}}
				/>
			);
		}
		return null;
	}
}

export const ViewEnts = withNotificationContext(withRouter(ViewEntsClass));
