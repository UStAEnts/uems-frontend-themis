import React from 'react';

import styles from './OpsPlanning.module.scss';
import { BasicEvent } from '../../events/view/Event';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { Theme } from '../../../theme/Theme';
import apiInstance, { EventList } from '../../../utilities/APIPackageGen';
import { UEMSEvent } from '../../../types/type-aliases';

type OpsPlanningProps = {} & NotificationPropsType;

type OpsPlanningState = {
	events?: EventList;
	states?: string[];
	selected?: string;
};

class OpsPlanningClass extends React.Component<
	OpsPlanningProps,
	OpsPlanningState
> {
	constructor(props: OpsPlanningProps, context: any) {
		super(props, context);

		this.makeCard = this.makeCard.bind(this);
		this.filterEvents = this.filterEvents.bind(this);
		this.state = {};
	}

	componentDidMount() {
		UIUtilities.load(this.props, apiInstance.events().review().get()).data(
			(data) => {
				this.setState((oldState) => ({
					...oldState,
					events: data,
				}));
			}
		);
		// TODO: what the fuck was this doing with strings
		UIUtilities.load(this.props, apiInstance.states().review().get()).data(
			(data) => {
				this.setState((oldState) => ({
					...oldState,
					states: data.map((e) => e.id),
				}));
			}
		);
	}

	private filterEvents = (updated: UEMSEvent) => {
		console.log('filtering events', updated, this.state.states);
		if (this.state.states === undefined) return;
		if (updated.state === undefined) return;
		if (!this.state.states.map((e) => e).includes(updated.state.id)) {
			this.setState((e) => {
				if (e === undefined) return e;
				return {
					...e,
					events: (e.events ?? []).filter((v) => v.id !== updated.id),
				};
			});
		}
	};

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

	private makeCard(event: UEMSEvent) {
		return (
			<div
				className={styles.card}
				onClick={() => {
					this.setState((s) => ({ ...s, selected: event.id }));
				}}
				key={`evt-card-${event.id}`}
			>
				<div className={styles.inner}>
					<strong>{event.name}</strong>
					<div>
						<strong>Start </strong>
						<span>{event.start}</span>
						<br />
						<strong>End </strong>
						<span>{event.end}</span>
						<br />
						<span className={styles.venues}>
							{event.venues.map((e) => e.name).join(', ')}
						</span>
						<br />
						{!event.reserved ? ['Space is not reserved', <br />] : ''}
						{this.state.states !== undefined &&
						event.state !== undefined &&
						this.state.states.includes(event.state.id)
							? 'In review'
							: ''}
					</div>
				</div>
				<div className={styles.lower}>
					<div style={{ backgroundColor: event.state?.color ?? 'black' }}>
						{event.state?.name ?? 'Not Assigned'}
					</div>
					<div style={{ backgroundColor: event.ents?.color ?? 'black' }}>
						{event.ents?.name ?? 'Not Assigned'}
					</div>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className={styles.opsPlanning}>
				<div className={styles.sidebar}>
					{(this.state.events ?? []).map(this.makeCard)}
				</div>
				<div className={styles.content}>
					{this.state.selected ? (
						<BasicEvent
							key={this.state.selected}
							id={this.state.selected}
							onChange={this.filterEvents}
						/>
					) : undefined}
				</div>
			</div>
		);
	}
}

export const OpsPlanning = OpsPlanningClass;
