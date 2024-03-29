import React from 'react';
import {
	faExclamationCircle,
	faNetworkWired,
	faSkullCrossbones,
	IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Redirect, withRouter } from 'react-router-dom';
import { TextField } from '../../../components/atoms/text-field/TextField';
import {
	KeyValueOption,
	Select,
} from '../../../components/atoms/select/Select';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { NotificationContextType } from '../../../context/NotificationContext';
import { Notification } from '../../../components/components/notification-renderer/NotificationRenderer';
import {
	failEarlySet,
	failEarlyStateSet,
} from '../../../utilities/AccessUtilities';
import './CreateEvent.scss';
import { UIUtilities } from '../../../utilities/UIUtilities';
import apiInstance, {
	EntState,
	POSTEventsBody,
	State,
	Venue,
} from '../../../utilities/APIPackageGen';

export type CreateEventPropsType = {
	isPage?: boolean;
	notificationContext?: NotificationContextType;
};

export type CreateEventStateType = {
	eventProperties: {
		name?: string;
		dates: {
			startDate?: Date;
			endDate?: Date;
		};
		attendance?: number;
		icon?: string;
		state?: State;
		ents?: EntState;
		venue?: Venue;
	};
	loaded: {
		venues: Venue[];
		states: State[];
		ents: EntState[];
	};
	uiProperties: {
		dateFocused: 'startDate' | 'endDate' | null;
		redirect?: string;
	};
};

class CreateEventClass extends React.Component<
	CreateEventPropsType,
	CreateEventStateType
> {
	static displayName = 'Create Event';

	constructor(props: Readonly<CreateEventPropsType>) {
		super(props);

		this.state = {
			eventProperties: {
				dates: {},
			},
			loaded: {
				venues: [],
				ents: [],
				states: [],
			},
			uiProperties: {
				dateFocused: null,
			},
		};
	}

	componentDidMount() {
		UIUtilities.load(this.props, apiInstance.ents().get({})).data(
			failEarlyStateSet(this.state, this.setState.bind(this), 'loaded', 'ents')
		);
		UIUtilities.load(this.props, apiInstance.states().get({})).data(
			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'loaded',
				'states'
			)
		);
		UIUtilities.load(this.props, apiInstance.venues().get({})).data(
			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'loaded',
				'venues'
			)
		);
	}

	private showNotification = (
		title: string,
		content?: string,
		icon?: IconDefinition,
		color?: string,
		action?: Notification['action']
	) => {
		if (this.props.notificationContext) {
			// @ts-ignore
			this.props.notificationContext.showNotification(
				title,
				content,
				icon,
				color,
				action
			);
		}
	};

	private saveEvent = () => {
		const warn = (title: string, description: string) => {
			this.showNotification(
				title,
				description,
				faExclamationCircle,
				Theme.WARNING
			);
		};

		if (this.state.eventProperties.name === undefined) {
			warn('Invalid Event Name', 'You must provide an event name');
			return;
		}
		if (this.state.eventProperties.venue === undefined) {
			warn('Invalid Venue', 'You must provide a venue');
			return;
		}
		if (this.state.eventProperties.dates.startDate === undefined) {
			warn('Invalid Start Date', 'You must provide a start date');
			return;
		}
		if (this.state.eventProperties.dates.endDate === undefined) {
			warn('Invalid End Date', 'You must provide an end date');
			return;
		}
		if (this.state.eventProperties.attendance === undefined) {
			warn('Invalid Attendance', 'You must provide an attendance figure');
			return;
		}

		if (isNaN(Number(this.state.eventProperties.attendance))) {
			warn('Invalid Attendance', 'Attendance must be a number');
			return;
		}

		if (
			this.state.eventProperties.dates.endDate.getTime() <
			this.state.eventProperties.dates.startDate.getTime()
		) {
			warn('Invalid End Date', 'End date must be after the start date');
			return;
		}

		if (
			this.state.eventProperties.dates.startDate.getTime() <
			new Date().getTime()
		) {
			warn('Invalid Start Date', 'Start date must be after right now');
			return;
		}

		const event: POSTEventsBody = {
			end: Math.floor(
				this.state.eventProperties.dates.endDate.getTime() / 1000
			),
			start: Math.floor(
				this.state.eventProperties.dates.startDate.getTime() / 1000
			),
			name: this.state.eventProperties.name,
			ents: this.state.eventProperties.ents?.id,
			attendance: Number(this.state.eventProperties.attendance),
			state: this.state.eventProperties.state?.id,
			venue: this.state.eventProperties.venue.id,
		};

		UIUtilities.load(
			this.props,
			apiInstance.events().post(event),
			(e) => `Failed to create the event! ${e}`
		).data((id) => {
			if (id.length !== 1 || typeof id[0] !== 'string') {
				UIUtilities.tryShowNotification(
					this.props.notificationContext,
					'Failed to save',
					`Received an error response: ID was not returned`,
					faNetworkWired,
					Theme.FAILURE
				);
			}

			this.setState((old) => ({
				...old,
				uiProperties: {
					redirect: `/events/${id[0]}`,
					dateFocused: null,
				},
			}));
		});
	};

	private showFailNotification = (title: string, message: string) => {
		if (this.props.notificationContext) {
			try {
				this.props.notificationContext.showNotification(
					title,
					message,
					faSkullCrossbones,
					Theme.FAILURE
				);
			} catch (e) {
				console.error('Notification system is not initialised');
			}
		}
	};

	private makeQuickAttendanceSelect = (name: string, attendance: number) => (
		<Button
			color={Theme.GRAY_LIGHT}
			text={`${attendance} - ${name}`}
			// onClick={() => this.updateEventProperty('attendance')(attendance)}
			onClick={() =>
				failEarlySet(this.state, 'eventProperties', 'attendance')(attendance)
			}
		/>
	);

	render() {
		if (this.state.uiProperties.redirect) {
			return <Redirect to={this.state.uiProperties.redirect} />;
		}

		return (
			<div className={`create-event ${this.props.isPage ? 'page' : ''}`}>
				<div className="title">Create Event</div>
				<TextField
					name="Event Name"
					initialContent={this.state.eventProperties.name}
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'eventProperties',
						'name'
					)}
					required
				/>
				<Select
					placeholder="Venue"
					name="Venue"
					options={this.state.loaded.venues.map((e) => ({
						text: e.name,
						value: e.name,
						additional: e,
					}))}
					onSelectListener={(option: KeyValueOption) =>
						failEarlyStateSet(
							this.state,
							this.setState.bind(this),
							'eventProperties',
							'venue'
						)(option.additional)
					}
				/>
				<TextField
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'eventProperties',
						'dates',
						'startDate'
					)}
					name="start-date"
					placeholder="Event Start Date"
					required
					type="datetime"
				/>
				<TextField
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'eventProperties',
						'dates',
						'endDate'
					)}
					name="end-date"
					placeholder="Event End Date"
					required
					type="datetime"
				/>
				<TextField
					name="Projected Attendance"
					initialContent={this.state.eventProperties.attendance}
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'eventProperties',
						'attendance'
					)}
					required
					type="number"
				/>
				<div className="label">Quick Select</div>
				{(
					[
						['Seated StAge', 121],
						['Beacon Bar', 140],
						["Sandy's Bar", 100],
						['601 (Standing)', 400],
						['StAge (Standing)', 345],
						['StAge (Theatre)', 165],
						['601 & StAge', 1200],
					] as [string, number][]
				).map((a) => this.makeQuickAttendanceSelect(a[0], a[1]))}
				<Select
					placeholder="Status"
					name="status"
					options={this.state.loaded.states.map((e) => ({
						text: e.name,
						value: e.name,
						additional: e,
					}))}
					onSelectListener={(option: KeyValueOption) =>
						failEarlyStateSet(
							this.state,
							this.setState.bind(this),
							'eventProperties',
							'state'
						)(option.additional)
					}
				/>
				<Select
					placeholder="Ents State"
					name="ents"
					options={this.state.loaded.ents.map((e) => ({
						text: e.name,
						value: e.name,
						additional: e,
					}))}
					onSelectListener={(option: KeyValueOption) =>
						failEarlyStateSet(
							this.state,
							this.setState.bind(this),
							'eventProperties',
							'ents'
						)(option.additional)
					}
				/>
				<Button
					color={Theme.SUCCESS}
					text="Submit"
					fullWidth={this.props.isPage}
					onClick={this.saveEvent}
				/>
				{this.props.isPage ? undefined : (
					<Button color={Theme.FAILURE} text="Cancel" />
				)}
			</div>
		);
	}
}

// @ts-ignore
export const CreateEvent = withRouter(
	withNotificationContext(CreateEventClass)
);
