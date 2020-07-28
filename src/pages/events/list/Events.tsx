import * as React from 'react';
import Loader from 'react-loader-spinner';
import { Calendar as CalendarElement } from '../../../components/components/calendar/Calendar';
import { TabPane } from '../../../components/components/tab-pane/TabPane';
import { EventTable } from '../../../components/components/event-table/EventTable';
import { Theme } from '../../../theme/Theme';

import './Events.scss';
import { API, EventResponse } from '../../../utilities/APIGen';

export type CalendarPropsType = {};

export type CalendarStateType = {
    /**
     * The list of events loaded from the gateway
     */
    events?: EventResponse[],
    /**
     * the error to be displayed if one has been provided
     */
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

    /**
     * Load the events from the API endpoint and update the state with the properties or populate the error state
     */
    private loadComments() {
        API.events.get().then((events) => {
            this.setState({
                events: events.result,
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

        console.log(this.state.events);
        return (
            <div
                style={{
                    padding: '20px',
                }}
                className="events-page"
            >
                <TabPane
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