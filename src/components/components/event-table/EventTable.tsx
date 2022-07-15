/* eslint-disable */
import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Theme } from '../../../theme/Theme';
import {
	DateFilterStatus,
	Filter,
	FilterConfiguration,
	FilterPropsType,
	NumberFilterStatus,
	SearchFilterStatus,
	SelectFilterStatus,
} from '../filter/Filter';

import './EventTable.scss';
import moment from 'moment';
import { LinkedTD } from '../../atoms/LinkedTD';
import { Redirect } from 'react-router';
import { IconName } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from '../../../utilities/ColorUtilities';
import { KeyValueOption } from '../../atoms/select/Select';
import VenueChip from '../../atoms/venue-chip/VenueChip';
import apiInstance, {
	EntState,
	EntStateList,
	EventList,
	State,
	StateList,
	Venue,
	VenueList,
} from '../../../utilities/APIPackageGen';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { withNotificationContext } from '../../WithNotificationContext';
import { UEMSEvent } from '../../../types/type-aliases';

export type EventTablePropsType = {
	/**
	 * The list of events to display in this table
	 */
	events: EventList;
	filters?: { [key: string]: FilterConfiguration };
	onFiltersChange?: FilterPropsType['onFilterChange'];
} & NotificationPropsType;

export type EventTableStateType = {
	/**
	 * A set of filters to apply to the table
	 */
	filters: { [key: string]: FilterConfiguration };
	/**
	 * If set the {@link Redirect} element will be rendered which will force the page to redirect to the path set here.
	 * This makes it easy to trigger a redirect without having to be in the render function
	 */
	forcedRedirect?: string;

	loaded: {
		venues?: VenueList;
		states?: StateList;
		ents?: EntStateList;
	};
};

class EventTableInner extends React.Component<
	EventTablePropsType,
	EventTableStateType
> {
	static displayName = 'EventTable';

	constructor(props: Readonly<EventTablePropsType>) {
		super(props);

		this.state = {
			filters: props.filters ?? {},
			loaded: {},
		};

		this.makeEntsStatus = this.makeEntsStatus.bind(this);
		this.makeEventState = this.makeEventState.bind(this);
		this.eventToRow = this.eventToRow.bind(this);
		this.filter = this.filter.bind(this);
		this.redirect = this.redirect.bind(this);
	}

	componentDidMount() {
		UIUtilities.load(this.props, apiInstance.venues().get({})).data((venues) =>
			this.setState((oldState) => ({
				...oldState,
				loaded: {
					...oldState.loaded,
					venues,
				},
			}))
		);
		UIUtilities.load(this.props, apiInstance.states().get({})).data((states) =>
			this.setState((old) => ({
				...old,
				loaded: {
					...old.loaded,
					states,
				},
			}))
		);
		UIUtilities.load(this.props, apiInstance.ents().get({})).data((ents) =>
			this.setState((old) => ({
				...old,
				loaded: {
					...old.loaded,
					ents,
				},
			}))
		);
	}

	/**
	 * Returns an ents state based on the value in the event, either 'unknown' by default or the value held in the event
	 */
	private makeEntsStatus(entsStatus: undefined | EntState) {
		let status = <div className="ents-state unknown">Unknown</div>;

		if (entsStatus !== undefined) {
			if (entsStatus.color !== undefined) {
				status = (
					<div
						className="ents-state unknown"
						style={{
							backgroundColor: entsStatus.color,
							color: ColorUtilities.determineForegroundColor(entsStatus.color),
						}}
					>
						{entsStatus.name}
					</div>
				);
			} else {
				status = (
					<div className={`ents-state ${entsStatus.name}`}>
						{entsStatus.name}
					</div>
				);
			}
		}

		return status;
	}

	/**
	 * Returns an ents state based on the value in the event, either 'unknown' by default or the value held in the event
	 */
	private makeEventState(entsStatus: undefined | State) {
		let status = <div className="ents-state unknown">Unknown</div>;

		if (entsStatus !== undefined) {
			if (entsStatus.color !== undefined) {
				status = (
					<div
						className="ents-state unknown"
						style={{ backgroundColor: entsStatus.color }}
					>
						{entsStatus.icon ? (
							<FontAwesomeIcon icon={entsStatus.icon as IconName} />
						) : undefined}
						{entsStatus.name}
					</div>
				);
			} else {
				status = (
					<div
						style={{
							backgroundColor: Theme.GRAY_LIGHT,
						}}
						className={`ents-state ${entsStatus.name}`}
					>
						{entsStatus.icon ? (
							<FontAwesomeIcon icon={entsStatus.icon as IconName} />
						) : undefined}
						{entsStatus.name}
					</div>
				);
			}
		}

		return status;
	}

	/**
	 * Converts an event to a row in the table. This returns a TR element which redirects to the event page. Each
	 * box in the table is rendered with {@link LinkedTD} which will allow it to be supported by screen readers.
	 * @param event the event to render.
	 */
	private eventToRow(event: UEMSEvent) {
		return (
			<tr
				key={event.id}
				data-testid={`et-row-${event.id}`}
				// @ts-ignore
				onClick={() => this.redirect(`/events/${event.id}`)}
			>
				<LinkedTD to={`/events/${event.id}`}>
					{/* TODO: Icons do not current exist on events */}
					{/*{event.icon*/}
					{/*    ? <FontAwesomeIcon icon={event.icon} />*/}
					{/*    : undefined}*/}
				</LinkedTD>

				<LinkedTD to={`/events/${event.id}`}>{event.name}</LinkedTD>
				<LinkedTD to={`/events/${event.id}`}>
					{event.venues.map((e) => (
						<VenueChip venue={e} key={e.id} />
					))}
				</LinkedTD>
				<LinkedTD to={`/events/${event.id}`}>
					{moment.unix(event.start).format(' dddd Do MMMM (YYYY), HH:mm ')}
					&#8594;
					{moment.unix(event.end).format(' dddd Do MMMM (YYYY), HH:mm ')}
				</LinkedTD>
				<LinkedTD to={`/events/${event.id}`}>
					<ReactTimeAgo date={event.start} />
				</LinkedTD>
				<LinkedTD to={`/events/${event.id}`}>
					{this.makeEntsStatus(event.ents)}
				</LinkedTD>
				<LinkedTD to={`/events/${event.id}`}>
					{this.makeEventState(event.state)}
				</LinkedTD>
			</tr>
		);
	}

	/**
	 * Updates the state to set the forced redirect value
	 * @param to the url to which we should redirect
	 */
	private redirect(to: string) {
		this.setState((oldState) => ({
			...oldState,
			forcedRedirect: to,
		}));
	}

	/**
	 * Runs the set of filters against this event and returns whether it matches. This will verify names, dates, states,
	 * ents states and venues. If it returns false it means the event does not match the filters.
	 * @param event the event to test
	 */
	private filter(event: UEMSEvent) {
		if ('name' in this.state.filters) {
			const filter = this.state.filters.name;

			if (
				!event.name
					.toLowerCase()
					.includes((filter.value as string).toLowerCase())
			)
				return false;
		}

		if ('date' in this.state.filters) {
			const filter = this.state.filters.date;

			if (
				filter.value &&
				typeof filter.value === 'object' &&
				'startDate' in filter.value
			) {
				if (filter.value.startDate !== null) {
					if (moment(filter.value.startDate).isAfter(moment.unix(event.start)))
						return false;
				}
			}

			if (
				filter.value &&
				typeof filter.value === 'object' &&
				'endDate' in filter.value
			) {
				if (moment(filter.value.endDate).isBefore(moment.unix(event.end)))
					return false;
			}
		}

		if ('state' in this.state.filters) {
			const filter = this.state.filters.state;

			if (typeof filter.value === 'string') return true;

			if (
				typeof filter.value === 'object' &&
				'value' in filter.value &&
				filter.value.value !== 'any'
			) {
				if (
					event.state?.name.toLowerCase() !==
					(filter.value.additional as State).name.toLowerCase()
				)
					return false;
			}
		}

		if ('ents' in this.state.filters) {
			const filter = this.state.filters.ents;

			if (typeof filter.value === 'string') return true;

			if (
				typeof filter.value === 'object' &&
				'value' in filter.value &&
				filter.value.value !== 'any'
			) {
				if (
					event.ents?.name.toLowerCase() !==
					(filter.value.additional as EntState).name.toLowerCase()
				)
					return false;
			}
		}

		if ('venues' in this.state.filters) {
			const filter = this.state.filters.venues;

			if (typeof filter.value === 'string') return true;

			if (
				typeof filter.value === 'object' &&
				'value' in filter.value &&
				filter.value.value !== 'any'
			) {
				if (
					!event.venues
						.map((e) => e.name.toLowerCase())
						.includes((filter.value.additional as Venue).name.toLowerCase())
				)
					return false;
				// if (event.venue?.name.toLowerCase() !== (filter.selectedOption.additional as VenueResponse).name.toLowerCase()) return false;
			}
		}

		return true;
	}

	/**
	 * Renders the table with filters for name, date, state, ents and venues.
	 */
	render() {
		const filters: { [key: string]: FilterConfiguration } = {
			name: {
				name: 'Event Name',
				type: 'search',
			},
			date: {
				name: 'Event Date',
				type: 'date',
			},
		};

		if (this.state.filters.date) {
			const version = this.state.filters.date;
			if (typeof version.value === 'object' && 'startDate' in version.value) {
				if (version.value.startDate && version.value.endDate) {
					filters.date.value = {
						startDate: version.value.startDate,
						endDate: version.value.endDate,
					};
				}
			}
		}

		if (this.state.loaded.ents) {
			const entsFilter: KeyValueOption[] = this.state.loaded.ents.map((e) => ({
				value: e.id,
				text: e.name,
				additional: e,
			}));

			entsFilter.push({
				value: 'any',
				text: 'any',
			});

			filters['ents'] = {
				name: 'Ents Status',
				type: 'option',
				options: entsFilter,
			};
		}

		if (this.state.loaded.states) {
			const stateFilter: KeyValueOption[] = this.state.loaded.states.map(
				(e) => ({
					additional: e,
					value: e.id,
					text: e.name,
				})
			);

			stateFilter.push({
				value: 'any',
				text: 'any',
			});

			filters['state'] = {
				name: 'Event State',
				type: 'option',
				options: stateFilter,
			};
		}

		if (this.state.loaded.venues) {
			const venueFilter: KeyValueOption[] = this.state.loaded.venues.map(
				(e) => ({
					text: e.name,
					value: e.id,
					additional: e,
				})
			);

			venueFilter.push({
				value: 'any',
				text: 'any',
			});

			filters['venues'] = {
				name: 'Venue',
				type: 'option',
				options: venueFilter,
			};
		}

		return (
			<div className="events-table">
				{this.state.forcedRedirect ? (
					<Redirect to={this.state.forcedRedirect} />
				) : undefined}
				<Filter
					filters={filters}
					onFilterChange={(filters) => {
						this.setState(
							{
								filters,
							},
							() => {
								if (this.props.onFiltersChange)
									this.props.onFiltersChange(this.state.filters);
							}
						);
					}}
				/>
				<table>
					<thead>
						<tr>
							<th className="icon-column" />
							<th className="name-column">Name</th>
							<th className="venue-column">Venue</th>
							<th className="time-column">Time</th>
							<th className="status-column">Until</th>
							<th className="status-column">Ents</th>
							<th className="status-column">Building</th>
						</tr>
					</thead>
					<tbody>
						{this.props.events.filter(this.filter).map(this.eventToRow)}
					</tbody>
				</table>
			</div>
		);
	}
}

export const EventTable = withNotificationContext(EventTableInner);
