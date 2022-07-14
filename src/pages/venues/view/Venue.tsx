import React from 'react';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { Theme } from '../../../theme/Theme';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import apiInstance, {
	EventList,
	PATCHVenuesIdBody,
	Venue as UEMSVenue,
} from '../../../utilities/APIPackageGen';

export type ViewVenueProps = {
	venue: UEMSVenue;
	events?: EventList;
} & NotificationPropsType;

type State = {
	venue: UEMSVenue;
	events: EventList;
} & FallibleReactStateType;

class VenueClass extends FallibleReactComponent<ViewVenueProps, State> {
	static displayName = 'Venue';

	constructor(props: ViewVenueProps) {
		super(props);
		this.state = { venue: props.venue, events: props.events ?? [] };
	}

	private patch = (update: PATCHVenuesIdBody) => {
		UIUtilities.load(
			this.props,
			apiInstance.venues().id(this.props.venue.id).patch(update),
			(e) => `Failed to update your venue! ${e}`
		).data(() => {
			// To fix some typing
			if (!this.state.venue) return;

			const newVenue: UEMSVenue = {
				...this.state.venue,
				...update,
			};

			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'venue'
			)(newVenue);
		});
	};

	componentDidMount() {
		if (this.props.events === undefined) {
			loadAPIData<State>(
				[
					{
						call: apiInstance.venues().id(this.props.venue.id).events().get,
						stateName: 'events',
						params: [],
					},
				],
				this.setState.bind(this),
				() => UIUtilities.tryShowPartialWarning(this)
			);
		}
	}

	realRender() {
		return (
			<EventOrCommentRelatedView
				obj={this.state.venue}
				patch={(changes: UEMSVenue) => {
					this.patch(changes);
				}}
				configOverrides={[
					{
						property: 'color',
						type: 'color',
					},
				]}
				excluded={['id', 'user', 'date']}
				events={this.state.events}
				delete={{
					redirect: '/venues',
					onDelete: () =>
						UIUtilities.deleteWith409Support(() =>
							apiInstance.venues().id(this.props.venue.id).delete()
						),
				}}
			/>
		);
	}
}

const Venue = withNotificationContext(VenueClass);
export default Venue;
