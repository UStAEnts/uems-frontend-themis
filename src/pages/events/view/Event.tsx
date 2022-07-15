import React, { FunctionComponent } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Loader from 'react-loader-spinner';

import moment from 'moment';
import ReactTimeAgo from 'react-time-ago';
import {
	faFileCode,
	faNetworkWired,
	faSkullCrossbones,
	faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { NotificationContextType } from '../../../context/NotificationContext';
import { FileList } from '../../../components/atoms/file-bar/FileBar';
import { CommentList } from '../../../components/components/comment-list/CommentList';
import { EditableProperty } from '../../../components/components/editable-property/EditableProperty';
import { Theme } from '../../../theme/Theme';
import {
	KeyValueOption,
	Select,
} from '../../../components/atoms/select/Select';
import { Button } from '../../../components/atoms/button/Button';
import { GlobalContext } from '../../../context/GlobalContext';
import './Event.scss';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { RemovableVenueChip } from '../../../components/atoms/venue-chip/VenueChip';
import apiInstance, {
	UEMSFile,
	CommentList as UEMSCommentList,
	EntState,
	State,
	Topic,
	Signup,
	Venue,
	PATCHEventsIdBody,
	User,
	EventList,
} from '../../../utilities/APIPackageGen';

type UEMSEvent = EventList[number];

export type SimpleEventProps = {
	notificationContext?: NotificationContextType;
	/**
	 * The ID of the event to be rendered. This will be looked up from the API endpoint
	 */
	id: string;
	onChange?: (event: UEMSEvent) => void;
};

export type EventPropsType = {
	notificationContext?: NotificationContextType;
	onChange?: (event: UEMSEvent) => void;
} & RouteComponentProps<{
	/**
	 * The ID of the event to be rendered. This will be looked up from the API endpoint
	 */
	id: string;
}>;

export type EventStateType = {
	/**
	 * The ID of this event
	 */
	id?: string;
	/**
	 * The retrieved event properties
	 */
	event?: UEMSEvent;
	/**
	 * TODO: this had a type once
	 */
	changelog?: never[];
	/**
	 * The list of possible ents states to which this event can be updated
	 */
	entsStates?: EntState[];
	/**
	 * The list of possible building states to which this event can be updated
	 */
	buildingStates?: State[];
	files?: UEMSFile[];
	comments?: UEMSCommentList;
	topics?: Topic[];
	/**
	 * The venues that this event could take place in
	 */
	venues?: Venue[];
	/**
	 * All users signed on to this event and their roles
	 */
	signups?: Signup[];

	chosenRole?: string;
} & FallibleReactStateType;

class Event extends FallibleReactComponent<SimpleEventProps, EventStateType> {
	static displayName = 'Event';

	static contextType = GlobalContext;

	constructor(props: Readonly<SimpleEventProps>) {
		super(props);

		this.state = {
			id: this.props.id,
			chosenRole: 'Other',
			loading: true,
		};
	}

	shouldComponentUpdate(
		nextProps: Readonly<SimpleEventProps>,
		nextState: Readonly<EventStateType>,
		nextContext: any
	): boolean {
		if (nextProps.id !== this.props.id) return true;
		if (super.shouldComponentUpdate) {
			return (
				super.shouldComponentUpdate(nextProps, nextState, nextContext) ?? true
			);
		}

		return true;
	}

	/**
	 * When the components mount, we need to query the API for the actual properties we need
	 */
	componentDidMount() {
		UIUtilities.load(this.props, apiInstance.topics().get({})).data((d) =>
			this.setState((o) => ({ ...o, topics: d }))
		);
		UIUtilities.load(
			this.props,
			apiInstance.events().eventID(this.props.id).signups().get({})
		).data((d) => this.setState((o) => ({ ...o, signups: d })));
		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.props.id).comments().get()
		).data((d) => this.setState((o) => ({ ...o, comments: d })));
		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.props.id).files().get()
		).data((d) => this.setState((o) => ({ ...o, files: d })));
		UIUtilities.load(this.props, apiInstance.venues().get({})).data((d) =>
			this.setState((o) => ({ ...o, venues: d }))
		);
		UIUtilities.load(this.props, apiInstance.ents().get({})).data((d) =>
			this.setState((o) => ({ ...o, entsStates: d }))
		);
		UIUtilities.load(this.props, apiInstance.states().get({})).data((d) =>
			this.setState((o) => ({ ...o, buildingStates: d }))
		);
		// UIUtilities.load(this.props, apiInstance.events().id(this.props.id).get())
		// 	.data((d) => this.setState((o) => ({ ...o, event: d.event })));
		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.props.id).get()
		).data((d) =>
			this.setState((o) => ({
				...o,
				event: d.event,
				changelog: d.changelog,
				loading: false,
			}))
		);
		// TODO: reintroduce changelog
	}

	private failedLoad = (reason: string) => {
		if (this.props.notificationContext) {
			try {
				this.props.notificationContext.showNotification(
					'Failed to Load',
					`There was an error: ${reason}`,
					faSkullCrossbones,
					Theme.FAILURE
				);
				console.log('Notification shown');
			} catch (e) {
				console.error('Notification system failed to send');
			}
		}
	};

	private patchEvent = (changeProps: PATCHEventsIdBody) => {
		if (!this.state.event) return;

		const filtered: Partial<UEMSEvent> = Object.fromEntries(
			Object.entries(changeProps).filter(([, value]) => value !== undefined)
		);
		if (Object.prototype.hasOwnProperty.call(filtered, 'ents')) {
			filtered.ents = this.state.entsStates?.find(
				(e) => e.id === changeProps.ents
			);
		}
		if (Object.prototype.hasOwnProperty.call(filtered, 'state')) {
			filtered.state = this.state.buildingStates?.find(
				(e) => e.id === changeProps.state
			);
		}
		if (Object.prototype.hasOwnProperty.call(filtered, 'start')) {
			// @ts-ignore
			filtered.start = Number(filtered.start) / 1000;
		}
		if (Object.prototype.hasOwnProperty.call(filtered, 'end')) {
			// @ts-ignore
			filtered.end = Number(filtered.end) / 1000;
		}
		console.log(filtered);

		if (Object.prototype.hasOwnProperty.call(changeProps, 'start')) {
			changeProps.start = Math.round(Number(changeProps.start) / 1000);
		}
		if (Object.prototype.hasOwnProperty.call(changeProps, 'end')) {
			changeProps.end = Math.round(Number(changeProps.end) / 1000);
		}
		if (Object.prototype.hasOwnProperty.call(changeProps, 'attendance')) {
			changeProps.attendance = Number(changeProps.attendance);
		}
		// TODO: REBUILD VENUE SELECTOR
		// if (Object.prototype.hasOwnProperty.call(filtered, 'venue')) {
		//     filtered.venue = this.state.venues?.find((e) => e.id === changeProps.venue);
		// }
		const updatedEvent: UEMSEvent = { ...this.state.event, ...filtered };

		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.state.event.id).patch(changeProps),
			(e) => `Failed to update the event! ${e}`
		).data(() => {
			// The response only contains an ID so we need to spread the updated parameters on top of the existing ones
			this.setState((oldState) => ({
				...oldState,
				event: updatedEvent,
			}));

			if (this.props.onChange) this.props.onChange(updatedEvent);
		});
	};

	private changeStartTime = (date: Date) => {
		// TODO: timezone issues?
		this.patchEvent({
			start: date.getTime(),
		});
	};

	private changeEndTime = (date: Date) => {
		// TODO: timezone issues?
		this.patchEvent({
			end: date.getTime(),
		});
	};

	private changeSelectedRole = (role: string) => {
		this.setState((oldState) => ({
			...oldState,
			chosenRole: role,
		}));
	};

	private signup = () => {
		if (this.state.chosenRole === undefined || this.state.event === undefined)
			return;

		UIUtilities.load(
			this.props,
			apiInstance.events().eventID(this.state.event.id).signups().post({
				role: this.state.chosenRole,
				signupUser: this.context.user.id,
			}),
			(e) => `Failed to sign up to this event! ${e}`
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

			this.setState((oldState) => ({
				signups: [
					{
						role: oldState.chosenRole ?? 'Unknown',
						date: new Date().getTime() / 1000,
						id: id[0] as string,
						user: this.context.user,
						event: this.state.event as UEMSEvent,
					},
					...(oldState.signups ?? []),
				],
			}));
		});
	};

	private removeSignup = (id: string) => {
		if (this.state.event === undefined) return;

		const stateID = this.state.event.id;

		UIUtilities.deleteWith409Support(() =>
			apiInstance.events().eventID(stateID).signups().id(id).delete()
		)
			.then((b) => {
				if (!b) throw new Error();
				this.setState((oldState) => ({
					signups: (oldState.signups ?? []).filter((e) => e.id !== id),
				}));
			})
			.catch((err) => {
				if (this.props.notificationContext) {
					this.props.notificationContext.showNotification(
						'Could not remove signup',
						`Failed to remove: ${err.message}`,
						faSkullCrossbones,
						Theme.FAILURE
					);
				}
			});
	};

	/**
	 * Generates a select editable property with the values provided. This currently does not support an udpate handler
	 * @param options the options which the user should be able to select
	 * @param name the name of the property which could be changed
	 * @param selected the currently selected value
	 */
	private generateEditableProperty = (
		options: string[] | KeyValueOption[] | undefined,
		name: string,
		selected: string | undefined,
		property: keyof PATCHEventsIdBody
	) =>
		options ? (
			<EditableProperty
				name={name}
				config={{
					options,
					type: 'select',
					// TODO: dangerous?
					onChange: (x: string | KeyValueOption) =>
						this.changeProperty(property)(
							typeof x === 'string' ? x : x.additional.id
						),
				}}
			>
				<div className="value">{selected || 'Not set'}</div>
			</EditableProperty>
		) : (
			<div>
				<div className="value">{selected || 'Not set'}</div>
				<div className="loader">
					<Loader type="Grid" color={Theme.NOTICE} width={20} height={20} />
				</div>
			</div>
		);

	private groupSignups = () => {
		if (this.state.signups === undefined) return {};

		const result: { [key: string]: Signup[] } = {};

		for (const signup of this.state.signups) {
			if (
				Object.prototype.hasOwnProperty.call(
					result,
					signup.role ?? 'Unassigned'
				)
			) {
				result[signup.role ?? 'Unassigned'].push(signup);
			} else {
				result[signup.role ?? 'Unassigned'] = [signup];
			}
		}

		return result;
	};

	private makeSignupComponent = (signupID: string, user: User) => (
		<div key={`signup.${user.id}.${signupID}`} className="signup">
			<Link className="user" to={`/users/${user.id}`}>
				<div className="profile">
					<img
						alt={`Profile for ${user.name}`}
						src={user.profile ?? '/default-icon.png'}
					/>
				</div>
				<div className="name">{user.name}</div>
			</Link>
			<div className="spacer" />
			{/* TODO: FIGURE OUT PERMISSIONS SO THIS IS NOT AVAILABLE TO EVERYONE */}
			<div className="remove">
				<FontAwesomeIcon
					icon={faTimes}
					onClick={() => this.removeSignup(signupID)}
				/>
			</div>
		</div>
	);

	private markComment = (type: 'resolve' | 'mark') => {
		return (comment: string) => {
			if (this.state.event === undefined) return;

			apiInstance
				.events()
				.id(this.state.event.id)
				.comments()
				.commentID(comment)
				[type === 'resolve' ? 'resolve' : 'attention']()
				.post()
				.then(() => {
					if (this.state.comments) {
						const commentClone = [...this.state.comments];
						const commentElement = commentClone.find((e) => e.id === comment);

						if (commentElement) {
							commentElement.requiresAttention = type === 'mark';
							this.setState((s) => ({
								...s,
								comments: commentClone,
							}));
						}
					}
				})
				.catch((e) => {
					if (this.props.notificationContext) {
						this.props.notificationContext.showNotification(
							'Could not resolve comment',
							`Failed to resolve comment due to an error! ${e.message}`,
							faSkullCrossbones,
							Theme.FAILURE
						);
					}
				});
		};
	};

	private sendComment = (comment: string, topicID: string) => {
		console.log('Send comment was called');
		if (this.state.event === undefined) return;

		console.log('Event was not undefined');
		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.state.event.id).comments().post({
				body: comment,
				topic: topicID,
				// TODO: move ot actual UI
				requiresAttention: false,
			}),
			(e) => {
				console.log('Error handler called');
				return `Failed to post your comment! ${e}`;
			}
		).data((id) => {
			console.log('Data received');
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
				comments: [
					{
						id: id[0] as string,
						body: comment,
						posted: new Date().getTime() / 1000,
						poster: this.context.user.value,
						// TODO: move to UI
						requiresAttention: false,
						topic: (old.topics ?? []).find((e) => e.id === topicID),
						assetID: this.props.id,
						assetType: 'event',
						attendedDate: undefined,
					},
					...(old.comments ?? []),
				],
			}));
		});
	};

	private changeProperty(property: keyof PATCHEventsIdBody) {
		return (e: any) => {
			const changes: PATCHEventsIdBody = {};

			changes[property] = e;

			this.patchEvent(changes);
		};
	}

	private renderSignups = () => {
		const grouped = this.groupSignups();

		return Object.entries(grouped)
			.map(([name, signups]) => [
				<div key={`role.${name}`} className="role">
					{name}
				</div>,
				...signups.map((e) => this.makeSignupComponent(e.id, e.user)),
			])
			.flat();
	};

	private editVenues = (action: 'add' | 'remove', ids: string[]) => {
		if (this.state.event === undefined) return;

		const edit: any = {};
		if (action === 'add') edit.addVenues = ids;
		else edit.removeVenues = ids;

		const replacement = { ...this.state.event };
		if (action === 'remove')
			replacement.venues = replacement.venues.filter(
				(e) => !ids.includes(e.id)
			);
		else
			replacement.venues = [
				...replacement.venues,
				...(this.state.venues?.filter((e) => ids.includes(e.id)) ?? []),
			];

		UIUtilities.load(
			this.props,
			apiInstance.events().id(this.state.event.id).patch(edit),
			(e) => `Failed to update the event! ${e}`
		).data((edit) => {
			this.setState((oldState) => ({
				...oldState,
				event: replacement,
			}));

			if (this.props.onChange) this.props.onChange(replacement);
		});
	};

	realRender() {
		const venueIDs = this.state.event?.venues.map((e) => e.id) ?? [];
		return this.state.event ? (
			<div className="event-view loaded">
				<div className="real">
					<EditableProperty
						name="name"
						config={{
							value: this.state.event.name,
							type: 'text',
							onChange: (name: string) =>
								this.patchEvent({
									name,
								}),
						}}
					>
						<h1 style={{ display: 'inline-block' }}>{this.state.event.name}</h1>
					</EditableProperty>
					<div className="properties-bar">
						<div className="property creation">
							<span className="label">Created</span>
							<span className="value">
								<ReactTimeAgo date={this.state.event.start * 1000} />
							</span>
						</div>
						<div className="property updates">
							<span className="label">Updates</span>
							<span className="value">
								{(this.state.comments ?? []).length +
									(this.state.changelog ?? []).length}
							</span>
						</div>
					</div>
					{/* TODO: add file loading */}
					{this.state.files ? <FileList files={this.state.files} /> : undefined}
					<Button
						color={Theme.GREEN}
						text="Attach new file"
						icon={faFileCode}
					/>
					{this.state.comments ? (
						<CommentList
							comments={this.state.comments}
							updates={this.state.changelog}
							topics={this.state.topics ?? []}
							onCommentSent={this.sendComment}
							onCommentResolved={this.markComment('resolve').bind(this)}
							onCommentMarked={this.markComment('mark').bind(this)}
						/>
					) : undefined}
				</div>
				<div className="rightbar-real">
					<div className="entry">
						<div className="title">Venue</div>
						<EditableProperty
							name="Add New Venue"
							config={{
								type: 'select',
								options: (this.state.venues ?? [])
									.filter((e) => !venueIDs.includes(e.id))
									.map((e) => ({ text: e.name, value: e.id })),
								onChange: (result) =>
									typeof result === 'string'
										? this.editVenues('add', [result])
										: this.editVenues('add', [result.value]),
							}}
						>
							{(this.state.event.venues ?? []).map((e) => (
								<RemovableVenueChip
									venue={e}
									key={e.id}
									onRemove={() => this.editVenues('remove', [e.id])}
								/>
							))}
						</EditableProperty>
					</div>
					<div className="entry">
						<div className="title">Reservation</div>
						<EditableProperty
							name="Reserved"
							config={{
								type: 'checkbox',
								value: this.state.event.reserved ?? false,
								onChange: this.changeProperty('reserved'),
							}}
						>
							{this.state.event.reserved ? 'Space reserved' : 'Unreserved'}
						</EditableProperty>
					</div>
					<div className="entry">
						<div className="title">Projected Attendance</div>
						<EditableProperty
							name="attendance"
							config={{
								type: 'text',
								onChange: this.changeProperty('attendance'),
								fieldType: 'number',
								value: this.state.event.attendance,
							}}
						>
							{this.state.event.attendance}
						</EditableProperty>
						{this.state.event.attendance >
						this.state.event.venues
							.map((e) => e.capacity)
							.reduce((a, b) => a + b, 0) ? (
							<i style={{ color: Theme.RED }}>
								Warning: projected attendance exceeds the total listed capacity
								of these venues
							</i>
						) : undefined}
					</div>
					<div className="entry">
						<div className="title">Ents State</div>
						{this.generateEditableProperty(
							this.state.entsStates
								? this.state.entsStates.map((e) => ({
										text: e.name,
										value: e.id,
										additional: e,
								  }))
								: undefined,
							'Ents State',
							this.state.event.ents ? this.state.event.ents.name : undefined,
							'ents'
						)}
					</div>
					<div className="entry">
						<div className="title">Building Status</div>
						{this.generateEditableProperty(
							this.state.buildingStates
								? this.state.buildingStates.map((e) => ({
										text: e.name,
										value: e.id,
										additional: e,
								  }))
								: undefined,
							'Building State',
							this.state.event.state ? this.state.event.state.name : undefined,
							'state'
						)}
					</div>
					<div className="entry">
						<div className="title">Timing</div>
						<div className="value flow">
							<div className="label">Booking Start</div>
							<div className="time">
								<EditableProperty
									name="Booking Start"
									config={{
										type: 'date',
										value: new Date(this.state.event.start * 1000),
										onChange: this.changeStartTime,
									}}
								>
									{moment
										.unix(this.state.event.start)
										.format('dddd Do MMMM (YYYY), HH:mm')}
								</EditableProperty>
							</div>
							<div className="bar" />
							<div className="duration">
								{moment
									.duration(
										moment
											.unix(this.state.event.start)
											.diff(moment.unix(this.state.event.end))
									)
									.humanize()}
							</div>
							<div className="bar" />
							<div className="label">Booking End</div>

							<div className="time">
								<EditableProperty
									name="Booking End"
									config={{
										type: 'date',
										value: new Date(this.state.event.end * 1000),
										onChange: this.changeEndTime,
									}}
								>
									{moment
										.unix(this.state.event.end)
										.format('dddd Do MMMM (YYYY), HH:mm')}
								</EditableProperty>
							</div>
						</div>
					</div>

					<div className="entry">
						<div className="title">Signups</div>
						<div className="signup-list">{this.renderSignups()}</div>
						<div className="title">Join</div>
						<Select
							placeholder="Role"
							name="role"
							options={[
								'Lighting (LX)',
								'Sound (S)',
								'Video / Projections (V)',
								'Stage Manager (SM)',
								'Event Manager (EM)',
								'General Tech (AV)',
								'Operator (OP)',
								'Shadow',
								'Other',
							]}
							initialOption={this.state.chosenRole}
							onSelectListener={this.changeSelectedRole}
						/>
						<Button
							color={Theme.PURPLE_LIGHT}
							onClick={this.signup}
							text="Signup"
						/>
					</div>
				</div>
				<div className="rightbar-spacer" />
			</div>
		) : (
			<div className="event-view loading-pane">
				<Loader
					type="BallTriangle"
					color={Theme.NOTICE}
					width={100}
					height={100}
				/>
			</div>
		);
	}
}

const RouteredEvent: FunctionComponent<EventPropsType> = ({
	match,
	notificationContext,
	onChange,
}) => {
	const copy: SimpleEventProps = {
		id: match.params.id,
		notificationContext,
		onChange,
	};
	return <Event {...copy} />;
};

/**
 * Bind the event page with the router so we can access the ID if the path
 */
// @ts-ignore
export default withRouter(withNotificationContext(RouteredEvent));
export const BasicEvent = Event;
