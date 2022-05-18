import {API, EventResponse, VenueResponse, VenueUpdate} from "../../../utilities/APIGen";
import React from "react";
import {failEarlyStateSet} from "../../../utilities/AccessUtilities";
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {faSkullCrossbones} from "@fortawesome/free-solid-svg-icons";
import {Theme} from "../../../theme/Theme";
import {EventOrCommentRelatedView} from "../../../components/components/event-related-view/EventOrCommentRelatedView";
import {loadAPIData} from "../../../utilities/DataUtilities";
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";
import {withNotificationContext} from "../../../components/WithNotificationContext";

export type ViewVenueProps = {
    venue: VenueResponse;
    events?: EventResponse[],
} & NotificationPropsType;

type State = {
    venue: VenueResponse,
    events: EventResponse[],
} & FallibleReactStateType


class VenueClass extends FallibleReactComponent<ViewVenueProps, State> {

    static displayName = 'Venue';

    constructor(props: ViewVenueProps) {
        super(props);
        this.state = {venue: props.venue, events: props.events ?? []};
    }

    private patch = (update: VenueUpdate) => {
        API.venues.id.patch(this.props.venue.id, update).then(() => {
            // To fix some typing
            if (!this.state.venue) return;

            const newVenue: VenueResponse = {
                ...this.state.venue,
                ...update,
            };

            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'venue',
            )(newVenue);
        }).catch((err) => {
            console.error(err);
            UIUtilities.tryShowNotification(
                this.props.notificationContext,
                'Failed to update venue',
                `There was an error submitting the update request: ${err.message}`,
                faSkullCrossbones,
                Theme.FAILURE,
            )
        });
    }

    componentDidMount() {
        if (this.props.events === undefined) {
            loadAPIData<State>([{
                    call: API.venues.id.events.get,
                    stateName: 'events',
                    params: [this.props.venue.id],
                }],
                this.setState.bind(this),
                () => UIUtilities.tryShowPartialWarning(this),
            );
        }
    }

    realRender() {
        return (
            <EventOrCommentRelatedView
                obj={this.state.venue}
                patch={(changes: VenueUpdate) => {
                    this.patch(changes);
                }}
                configOverrides={[
                    {
                        property: 'color',
                        type: 'color',
                    },
                ]}
                excluded={[
                    'id',
                    'user',
                    'date',
                ]}
                events={this.state.events}
                delete={{
                    redirect: '/venues',
                    onDelete: () => UIUtilities.deleteWith409Support(() => API.venues.id.delete(this.props.venue.id)),
                }}
            />
        );
    }
}

const Venue = withNotificationContext(VenueClass);
export default Venue;