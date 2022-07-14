import React, { CSSProperties } from 'react';
import styles from './Calendar.module.scss';
import { classes } from '../../../utilities/UIUtilities';
import moment, { Moment } from 'moment';
import { EVENT_VIEW } from '../../../utilities/Routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { EventList } from '../../../utilities/APIPackageGen';

type CalendarProps = {
	startDate?: Date;
	days: number;
	events: EventList;
	onDateChange?: (start: Moment, end: Moment) => void;
};

type CalendarState = {
	startDate: Moment;
	events: PositionedEvent[];
};

function hourToTop(hour: number, hours: number = 24) {
	return `calc(${hour + 1} * (100% / ${hours}))`;
}

function dayToLeft(
	day: number,
	offset: number = 0,
	split: number = 0,
	days: number = 5
) {
	if (offset !== 0) {
		const blockWidth = `${offset} * ((100% - 4pc) / ${days * (1 / split)})`;
		return `calc(4pc + (${day} * ((100% - 4pc) / ${days})) + ${blockWidth})`;
	}
	return `calc(4pc + (${day} * ((100% - 4pc) / ${days})))`;
}

function hoursToHeight(duration: number, hours: number = 24) {
	return `calc(${duration} * (100% / ${hours}))`;
}

function blockWidth(scale: number = 1, amount: number = 1, days: number = 5) {
	return `calc(((100% - 4pc) / ${days * (1 / scale)}) * ${amount})`;
}

const EventBlock: React.FunctionComponent<{
	event: PositionedEvent;
	startOfCalendar: Moment;
	days: number;
}> = (props) => {
	// const start = moment.unix(props.event.event.start);
	// const end = moment.unix(props.event.event.end);
	const dayOffset = props.event.startMoment.diff(props.startOfCalendar, 'days');
	const hourOffset =
		props.event.startMoment.hour() + props.event.startMoment.minute() / 60;
	const duration =
		props.event.endMoment.diff(props.event.startMoment, 'minutes') / 60;

	let internals: React.ReactNode[] = [];
	if (!props.event.parent) {
		internals = [
			<br />,
			<span>
				{moment.unix(props.event.event.start).format('h:mm')} -{' '}
				{moment.unix(props.event.event.end).format('h:mm A')}
			</span>,
			<br />,
			<span>{props.event.event.venues.map((e) => e.name).join(', ')}</span>,
		];
	}

	const colourOverride: CSSProperties = {};
	// if (props.event.event.color) {
	//     colourOverride.backgroundColor = props.event.event.color;
	// }

	return (
		<a
			href={EVENT_VIEW.make(props.event.parent ?? props.event.event.id)}
			className={styles.event}
			style={{
				left: dayToLeft(
					dayOffset,
					props.event.offset,
					props.event.split,
					props.days
				),
				top: hourToTop(hourOffset),
				height: hoursToHeight(duration),
				width: blockWidth(props.event.split, props.event.width, props.days),
				...colourOverride,
			}}
		>
			<strong>{props.event.event.name}</strong>
			{internals}
		</a>
	);
};

type PositionedEvent = {
	event: EventList[number];
	startMoment: Moment;
	endMoment: Moment;
	offset: number;
	split: number;
	width: number;
	parent?: string;
};

export class CalendarRedo extends React.Component<
	CalendarProps,
	CalendarState
> {
	private _cachedLayout: React.ReactNode[] | undefined;

	constructor(props: CalendarProps, context: any) {
		super(props, context);
		this.state = {
			events: CalendarRedo.position(props.events),
			startDate: moment
				.unix(
					(props.startDate ?? moment().startOf('week').toDate()).getTime() /
						1000
				)
				.hour(0)
				.minute(0)
				.seconds(0)
				.millisecond(0),
		};

		console.log(props.events);
		console.log(this.state.events);
	}

	private static position(events: EventList): PositionedEvent[] {
		// Go day by day
		const grouped: Record<number, PositionedEvent[]> = {};
		for (const e of events) {
			const em: PositionedEvent = {
				event: e,
				startMoment: moment.unix(e.start),
				endMoment: moment.unix(e.end),
				offset: 0,
				split: 0.1,
				width: 10,
			};

			if (em.startMoment.day() !== em.endMoment.day()) {
				const overlap = em.endMoment.diff(
					em.endMoment.clone().hours(0).minute(0).seconds(0).millisecond(0)
				);
				if (overlap !== 0) {
					const original = em.endMoment.clone();
					em.endMoment = em.startMoment
						.clone()
						.hours(23)
						.minute(59)
						.seconds(59)
						.millisecond(9999);
					// em.event.end = em.endMoment.unix();

					const newStart = em.endMoment
						.clone()
						.hours(0)
						.minute(0)
						.seconds(0)
						.millisecond(0);

					const n: PositionedEvent = {
						event: {
							...e,
							// start: newStart.unix(),
							// end: original.unix(),
							name: '*' + e.name,
						},
						width: 10,
						split: 0.1,
						offset: 0,
						parent: e.id,
						startMoment: newStart,
						endMoment: original,
					};

					if (grouped[n.startMoment.day()])
						grouped[n.startMoment.day()].push(n);
					else grouped[n.startMoment.day()] = [n];
				}
			}

			if (grouped[em.startMoment.day()]) grouped[em.startMoment.day()].push(em);
			else grouped[em.startMoment.day()] = [em];
		}

		const sets = Object.values(grouped).map((e) =>
			e.sort((a, b) => a.event.start - b.event.start)
		);

		for (const set of sets) {
			for (let i = 1; i < set.length; i++) {
				const prev = set[i - 1];
				const now = set[i];

				if (now.parent) continue;

				if (
					now.event.start > prev.event.start &&
					now.event.start <= prev.event.end
				) {
					if (now.event.start - prev.event.start <= 30 * 60) {
						prev.width *= 2 / 3;
						now.width = prev.width;
						now.offset = prev.offset + 3;
					} else {
						now.offset = prev.offset + 1;
						now.width = prev.width - 1;
					}
				}

				if (now.event.start === prev.event.start) {
					prev.width /= 2;
					now.width = prev.width;
					now.offset = prev.offset + prev.width;
				}
			}
		}

		const elements = sets.flat();

		for (const event of elements) {
			if (event.parent) {
				event.split =
					elements.find((e) => e.event.id === event.parent)?.split ?? 0.1;
				event.width =
					elements.find((e) => e.event.id === event.parent)?.width ?? 10;
				event.offset =
					elements.find((e) => e.event.id === event.parent)?.offset ?? 0;
			}
		}

		return elements;
	}

	render() {
		if (this._cachedLayout === undefined) {
			this._cachedLayout = [
				...Array(24)
					.fill(0)
					.map((_, i) => [
						<div
							className={styles.short}
							style={{ gridArea: `${i + 1}/1/${i + 2}/2` }}
							data-wtf={`${i + 1}/1/${i + 2}/2`}
						>
							<span>
								{i % 12 === 0 ? 12 : i % 12} {i > 12 ? 'PM' : 'AM'}
							</span>
						</div>,
						<div
							className={styles.long}
							style={{ gridArea: `${i + 1}/2/${i + 2}/${this.props.days + 2}` }}
						/>,
					])
					.flat(),
				...Array(this.props.days)
					.fill(0)
					.map((_, i) => (
						<div
							className={styles.vertical}
							style={{ gridArea: `1/${i + 2}/25/${i + 3}` }}
						/>
					)),
			];
		}

		const startOfRange = this.state.startDate.unix();
		const endOfRange = this.state.startDate.clone().add(7, 'days').unix();
		const matches = this.state.events.filter(
			(e) =>
				e.startMoment.unix() >= startOfRange &&
				e.startMoment.unix() < endOfRange
		);

		return (
			<div className={styles.calendar}>
				<div className={styles.buttons}>
					<div
						className={styles.button}
						onClick={() =>
							this.setState((s) => {
								const newDate = s.startDate.clone().subtract(7, 'days');
								if (this.props.onDateChange)
									this.props.onDateChange(
										newDate,
										newDate.clone().add(String(this.props.days), 'days')
									);

								return { ...s, startDate: newDate };
							})
						}
					>
						<FontAwesomeIcon icon={faArrowLeft} />
					</div>
					<div
						className={styles.button}
						onClick={() =>
							this.setState((s) => {
								const newDate = s.startDate.clone().add(7, 'days');
								if (this.props.onDateChange)
									this.props.onDateChange(
										newDate,
										newDate.clone().add(String(this.props.days), 'days')
									);

								return { ...s, startDate: newDate };
							})
						}
					>
						<FontAwesomeIcon icon={faArrowRight} />
					</div>
				</div>
				{Array(this.props.days)
					.fill(0)
					.map((_, i) => (
						<div
							className={classes(styles.topOne, styles.top)}
							style={{ gridArea: `1/${i + 2}/2/${i + 3}` }}
						>
							<div>
								<div className={styles.number}>
									<span>
										{this.state.startDate.clone().add(i, 'day').format('dd')}
									</span>
									{this.state.startDate.clone().add(i, 'day').date()}
								</div>
								<div className={styles.day}>
									{this.state.startDate.clone().add(i, 'day').format('MMMM')}
								</div>
							</div>
						</div>
					))}

				<div
					className={styles.content}
					style={{
						gridArea: `2/1/3/${this.props.days + 2}`,
						gridTemplateColumns: `4pc repeat(${this.props.days}, 1fr)`,
					}}
				>
					{matches.map((e) => (
						<EventBlock
							key={e.event.id + (e.parent ?? '')}
							event={e}
							startOfCalendar={this.state.startDate}
							days={this.props.days}
						/>
					))}
					{this._cachedLayout}
				</div>
			</div>
		);
	}
}
