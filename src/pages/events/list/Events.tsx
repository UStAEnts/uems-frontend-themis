import * as React from 'react';
import Loader from 'react-loader-spinner';
import { Calendar as CalendarElement } from '../../../components/components/calendar/Calendar';
import { TabPane } from '../../../components/components/tab-pane/TabPane';
import { EventTable } from '../../../components/components/event-table/EventTable';
import { Theme } from '../../../theme/Theme';

import './Events.scss';
import { API, EventResponse } from '../../../utilities/APIGen';
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";
import { loadAPIData } from "../../../utilities/DataUtilities";

export type CalendarPropsType = {};

export type CalendarStateType = {
    /**
     * The list of events loaded from the gateway
     */
    events?: EventResponse[],
} & FallibleReactStateType;

export class Events extends FallibleReactComponent<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    componentDidMount() {
        this.loadComments();
    }

    /**
     * Load the events from the API endpoint and update the state with the properties or populate the error state
     */
    private loadComments() {
        // API.events.get().then((events) => {
        //     this.setState({
        //         events: events.result,
        //     });
        // }).catch((err: Error) => {
        //     this.setState((oldState) => ({
        //         ...oldState,
        //         error: `Failed to load the events due to ${err.message}`,
        //     }));
        // });

        loadAPIData<CalendarStateType>([{
            call: API.events.get,
            stateName: 'events',
            params: [],
        }], this.setState.bind(this));
    }

    realRender() {
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
