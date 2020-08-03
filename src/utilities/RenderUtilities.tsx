import { EventResponse } from "./APIGen";
import ReactTimeAgo from "react-time-ago";
import moment from "moment";
import { ColorUtilities } from "./ColorUtilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, IconName } from "@fortawesome/free-solid-svg-icons";
import React from "react";

export class RenderUtilities {

    static renderBasicEvent(event: EventResponse) {
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
                                <ReactTimeAgo date={event.startDate * 1000} />
                            </div>
                        </div>
                        <div className="property collapsed">
                            <div className="label">Duration</div>
                            <div className="value">
                                {moment.duration(
                                    moment.unix(event.startDate).diff(moment.unix(event.endDate)),
                                ).humanize()}
                            </div>
                        </div>
                        <div className="property collapsed">
                            <div className="label">Venue</div>
                            {
                                !event.venue
                                    ? undefined
                                    : (
                                        <div
                                            className="value advanced"
                                            style={{
                                                backgroundColor: event.venue.color,
                                                color: event.venue.color
                                                    ? ColorUtilities.determineForegroundColor(event.venue.color)
                                                    : 'black',
                                            }}
                                        >
                                            <div className="name">
                                                {event.venue.name}
                                            </div>
                                        </div>
                                    )
                            }

                        </div>
                    </div>
                    <div className="right">
                        <div className="property collapsed">
                            <div className="label">Ents</div>
                            <div
                                className="value advanced"
                                style={{
                                    backgroundColor: event.ents.color,
                                    color: ColorUtilities.determineForegroundColor(event.ents.color),
                                }}
                            >
                                <div className="icon">
                                    <FontAwesomeIcon icon={(event.ents.icon ?? faQuestion) as IconName} />
                                </div>
                                <div className="name">
                                    {event.ents.name}
                                </div>
                            </div>
                        </div>
                        <div className="property collapsed">
                            <div className="label">End</div>
                            <div className="value">
                                <ReactTimeAgo date={event.endDate * 1000} />
                            </div>
                        </div>
                        <div className="property collapsed">
                            <div className="label">Building</div>
                            <div
                                className="value advanced"
                                style={{
                                    backgroundColor: event.state.color,
                                    color: event.state.color
                                        ? ColorUtilities.determineForegroundColor(event.state.color)
                                        : 'black',
                                }}
                            >
                                <div className="icon">
                                    <FontAwesomeIcon icon={(event.state.icon ?? faQuestion) as IconName} />
                                </div>
                                <div className="name">
                                    {event.state.name}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}
