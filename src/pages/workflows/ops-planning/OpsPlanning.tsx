import React from "react";

import styles from './OpsPlanning.module.scss';
import { BasicEvent } from "../../events/view/Event";
import { API, EventResponse, StateResponse } from "../../../utilities/APIGen";
import { UIUtilities } from "../../../utilities/UIUtilities";
import { NotificationPropsType } from "../../../context/NotificationContext";
import { faSkullCrossbones } from "@fortawesome/free-solid-svg-icons";
import { Theme } from "../../../theme/Theme";

type OpsPlanningProps = {} & NotificationPropsType;

type OpsPlanningState = {
    events?: EventResponse[],
    states?: StateResponse[],
    selected?: string,
};

class OpsPlanningClass extends React.Component<OpsPlanningProps, OpsPlanningState> {
    constructor(props: OpsPlanningProps, context: any) {
        super(props, context);

        this.makeCard = this.makeCard.bind(this);
        this.filterEvents = this.filterEvents.bind(this);
        this.state = {};
    }

    /**
     * Summary: this page is a single workflow for an ops planning meeting
     *  - Show all events that are pending approval (how?)
     *  - For each event show events in other venues at the same time
     *  - Show any clashes
     *
     *  TODO:
     *    * [x] Users need to be able to configure which state IDs match review states
     *    * [x ]New endpoint for fetching review events which uses these states
     *    * How should gateway persist data? MongoDB? Should this be on a microservice?
     *      * Needs some kind of shared store and we shouldn't add new modules, so mongo will have to do...
     *      * Can link this into logging as well
     *      * Gateway already uses mongo for sessions - need a new collection and maybe move collection
     *    * What to do when states are deleted?
     */


    componentDidMount() {
        API.events.review.get().then((data) => {
            if (data.status === 'PARTIAL') UIUtilities.tryShowPartialWarning(this);

            this.setState((oldState) => ({
                ...oldState,
                events: data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load events data');
            console.error(err);

            this.failedLoad(`Could not load event list list: ${err.message}`);
        });
        API.states.review.get().then((data) => {
            if (data.status === 'PARTIAL') UIUtilities.tryShowPartialWarning(this);
            console.log(data.result);
            this.setState((oldState) => ({
                ...oldState,
                states: data.result,
            }));
        }).catch((err: Error) => {
            console.error('Failed to load states data');
            console.error(err);

            this.failedLoad(`Could not load states list list: ${err.message}`);
        });
    }

    private filterEvents = (updated: EventResponse) => {
        console.log('filtering events', updated, this.state.states);
        if (this.state.states === undefined) return;
        if (updated.state === undefined) return;
        if (!this.state.states.map((e) => e.id).includes(updated.state.id)) {
            this.setState((e) => {
                if (e === undefined) return e;
                return {
                    ...e,
                    events: (e.events ?? []).filter((v) => v.id !== updated.id),
                }
            });
        }
    }

    private failedLoad = (reason: string) => {
        if (this.props.notificationContext) {
            try {
                this.props.notificationContext.showNotification(
                    'Failed to Load',
                    `There was an error: ${reason}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
                console.log('Notification shown');
            } catch (e) {
                console.error('Notification system failed to send');
            }
        }
    }

    private makeCard(event: EventResponse) {
        return (
            <div className={styles.card} onClick={() => {
                this.setState((s) => ({ ...s, selected: event.id }))
            }} key={`evt-card-${event.id}`}>
                <div className={styles.inner}>
                    <strong>{event.name}</strong>
                    <div>
                        <strong>Start </strong><span>{event.start}</span>
                        <br />
                        <strong>End </strong><span>{event.end}</span>
                        <br />
                        <span className={styles.venues}>{event.venues.map((e) => e.name).join(', ')}</span>
                    </div>
                </div>
                <div className={styles.lower}>
                    <div
                        style={{ backgroundColor: event.state?.color ?? 'black' }}>{event.state?.name ?? 'Not Assigned'}</div>
                    <div
                        style={{ backgroundColor: event.ents?.color ?? 'black' }}>{event.ents?.name ?? 'Not Assigned'}</div>
                </div>
            </div>
        )
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
                        />) : undefined}
                </div>
            </div>
        );
    }
}

export const OpsPlanning = OpsPlanningClass;
