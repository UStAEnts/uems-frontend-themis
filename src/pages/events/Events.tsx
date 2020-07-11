import axios from 'axios';
import * as React from 'react';
import { GatewayEvent } from '../../types/Event';
import { Calendar as CalendarElement } from '../../components/components/calendar/Calendar';
import { TabPane } from '../../components/components/tab-pane/TabPane';
import { EventTable } from '../../components/components/event-table/EventTable';
import Config from '../../config/Config';
import url from 'url';
import Loader from "react-loader-spinner";
import { Theme } from "../../theme/Theme";

import "./Events.scss";

export type CalendarPropsType = {};

export type CalendarStateType = {
    events?: GatewayEvent[],
    error?: string,
};

export class Events extends React.Component<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    constructor(props: Readonly<CalendarPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadComments();
    }

    private loadComments() {
        axios.get(url.resolve(Config.BASE_GATEWAY_URI, 'events'), {
            headers: {
                Authorization: 'Bearer hi',
            },
        }).then((data) => {
            this.setState({
                events: data.data.map((e: any) => {
                    let start_date = new Date(0);
                    start_date.setUTCSeconds(parseInt(e.event_start_date, 10));

                    let end_date = new Date(0);
                    end_date.setUTCSeconds(parseInt(e.event_end_date, 10));

                    return {
                        ...e,
                        name: e.event_name,
                        venue: 'not in data',
                        bookingStart: start_date,
                        bookingEnd: end_date,
                        attendance: -1,
                    };
                }) as unknown as GatewayEvent[],
            });
        }).catch((err: Error) => {
            this.setState((oldState) => ({
                ...oldState,
                error: `Failed to load the events due to ${err.message}`,
            }));
        });
    }

    render() {
        const loadOrError = this.state.error
            ? (
                <div>
                    {this.state.error}
                </div>
            )
            : (
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
                    unmountHidden
                    panes={[
                        {
                            key: 'calendar',
                            content: (
                                this.state.events
                                    ? <CalendarElement events={this.state.events} />
                                    : loadOrError
                            ),
                            name: 'Calendar',
                        },
                        {
                            name: 'Table',
                            content: (
                                this.state.events
                                    ? <EventTable events={this.state.events} />
                                    : loadOrError
                            ),
                            key: 'table',
                            initial: true,
                        },

                    ]}
                />
            </div>
        );
    }

}
