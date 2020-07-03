import { default as Axios } from 'axios';
import * as React from 'react';
import { Event } from '../../types/Event';
import { Calendar as CalendarElement } from '../../components/components/calendar/Calendar';
import { TabPane } from '../../components/components/tab-pane/TabPane';
import { EventTable } from "../../components/components/event-table/EventTable";
import { events } from "../style-demo/StyleDemo";

export type CalendarPropsType = {};

export type CalendarStateType = {
    events?: Event[]
};

export class Events extends React.Component<CalendarPropsType, CalendarStateType> {

    static displayName = 'Calendar';

    constructor(props: Readonly<CalendarPropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // this.loadComments();
    }

    private loadComments() {
        Axios.get('/events', {
            headers: {
                Authorization: 'Bearer hi',
            },
        }).then((data) => {
            this.setState({
                events: data.data.map((e: any) => ({
                    name: e.name,
                    venue: 'not in data',
                    bookingStart: new Date(e.start_date),
                    bookingEnd: new Date(e.end_date),
                    attendance: -1,
                })) as unknown as Event[],
            });
        });
    }

    render() {

        return (
            <div
                style={{
                    padding: '20px',
                }}
            >
                <TabPane
                    unmountHidden
                    panes={[
                        {
                            key: 'calendar',
                            content: (
                                <div>
                                    {this.state.events
                                        ? <CalendarElement events={this.state.events} />
                                        : <p>Loading...</p>}
                                </div>
                            ),
                            name: 'Calendar',
                        },
                        {
                            name: 'Table',
                            content: (
                                this.state.events
                                    ? <EventTable events={events} />
                                    : <p>Loading...</p>
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
