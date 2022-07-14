import * as React from 'react';
import Loader from 'react-loader-spinner';
import { TabPane } from '../../../components/components/tab-pane/TabPane';
import { EventTable } from '../../../components/components/event-table/EventTable';
import { Theme } from '../../../theme/Theme';

import './Events.scss';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { CalendarRedo } from '../../../components/atoms/calendar/Calendar';
import moment, { Moment } from 'moment';
import apiInstance, { EventList } from '../../../utilities/APIPackageGen';

export type CalendarPropsType = {} & NotificationPropsType;

export type CalendarStateType = {
	/**
	 * The list of events loaded from the gateway
	 */
	events?: EventList;
	start: Moment;
	end: Moment;
	selected?: string;
} & FallibleReactStateType;

class EventsClass extends FallibleReactComponent<
	CalendarPropsType,
	CalendarStateType
> {
	static displayName = 'Calendar';

	constructor(props: Readonly<CalendarPropsType>) {
		super(props);
		this.state = {
			start: moment().startOf('week').subtract('1', 'minute'),
			end: moment().startOf('week').add('7', 'days').subtract('1', 'minute'),
		};
	}

	componentDidMount() {
		this.setState(
			(s) => ({ ...s, loading: true }),
			() => {
				UIUtilities.load(
					this.props,
					apiInstance.events().get({
						startBefore: this.state.end.unix(),
						startAfter: this.state.start.unix(),
					})
				).data((data) => {
					this.setState((s) => ({
						...s,
						loading: false,
						calendarEvents: data,
						tableEvents: data,
					}));
				});
			}
		);
	}

	realRender() {
		const loadOrError = this.state.error ? (
			<div>{this.state.error}</div>
		) : (
			<div className="loading-pane">
				<Loader
					type="BallTriangle"
					color={Theme.NOTICE}
					height={100}
					width={100}
				/>
			</div>
		);

		return (
			<div
				style={{
					padding: '20px',
				}}
				className="events-page"
			>
				<TabPane
					style={{ flexGrow: 1 }}
					listeners={{
						onTabChange: (_, pane) =>
							this.setState((s) => ({ ...s, selected: pane.key })),
					}}
					panes={[
						{
							key: 'calendar',
							content: this.state.events ? (
								<CalendarRedo
									events={this.state.events}
									days={7}
									startDate={this.state.start.toDate()}
									onDateChange={(st, en) =>
										this.setState(
											(s) => ({
												...s,
												start: st,
												end: en,
											}),
											() => this.componentDidMount()
										)
									}
								/>
							) : (
								loadOrError
							),
							name: 'Calendar',
							initial: this.state.selected === 'calendar',
						},
						{
							name: 'Table',
							content: this.state.events ? (
								<EventTable
									events={this.state.events}
									filters={{
										date: {
											startDate: this.state.start,
											endDate: this.state.end,
										},
									}}
								/>
							) : (
								loadOrError
							),
							key: 'table',
							initial: this.state.selected
								? this.state.selected === 'table'
								: true,
						},
					]}
				/>
			</div>
		);
	}
}

export const Events = withNotificationContext(EventsClass);
