import ReactTimeAgo from 'react-time-ago';
import moment from 'moment';
import { ColorUtilities } from './ColorUtilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion, IconName } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { UEMSEvent } from '../types/type-aliases';

export class RenderUtilities {
	static renderBasicEvent(event: UEMSEvent) {
		return (
			<div className="event-render">
				<div className="name">{event.name}</div>
				<div className="id">{event.id}</div>
				<div className="columns">
					<div className="left">
						<div className="property collapsed">
							<div className="label">Attendance</div>
							<div className="value">{event.attendance}</div>
						</div>
						<div className="property collapsed">
							<div className="label">Start</div>
							<div className="value">
								<ReactTimeAgo date={event.start * 1000} />
							</div>
						</div>
						<div className="property collapsed">
							<div className="label">Duration</div>
							<div className="value">
								{moment
									.duration(
										moment.unix(event.start).diff(moment.unix(event.end))
									)
									.humanize()}
							</div>
						</div>
						<div className="property collapsed">
							<div className="label">Venue</div>
							{event.venues.map((venue) => (
								<div
									className="value advanced"
									style={{
										backgroundColor: venue.color,
										color: venue.color
											? ColorUtilities.determineForegroundColor(venue.color)
											: 'black',
									}}
								>
									<div className="name">{venue.name}</div>
								</div>
							))}
						</div>
					</div>
					<div className="right">
						<div className="property collapsed">
							<div className="label">Ents</div>
							<div
								className="value advanced"
								style={
									event.ents
										? {
												backgroundColor: event.ents.color,
												color: ColorUtilities.determineForegroundColor(
													event.ents.color
												),
										  }
										: { backgroundColor: 'white', color: 'black' }
								}
							>
								<div className="icon">
									<FontAwesomeIcon
										icon={(event.ents?.icon ?? faQuestion) as IconName}
									/>
								</div>
								<div className="name">{event.ents?.name ?? 'No state'}</div>
							</div>
						</div>
						<div className="property collapsed">
							<div className="label">End</div>
							<div className="value">
								<ReactTimeAgo date={event.end * 1000} />
							</div>
						</div>
						<div className="property collapsed">
							<div className="label">Building</div>
							<div
								className="value advanced"
								style={{
									backgroundColor: event.state?.color,
									color: event.state?.color
										? ColorUtilities.determineForegroundColor(event.state.color)
										: 'black',
								}}
							>
								<div className="icon">
									<FontAwesomeIcon
										icon={(event.state?.icon ?? faQuestion) as IconName}
									/>
								</div>
								<div className="name">{event.state?.name}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
