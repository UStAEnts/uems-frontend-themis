import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EventResponse, VenueResponse, VenueUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';

export type ViewVenuePropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewVenueStateType = {
    venue?: VenueResponse,
    events?: EventResponse[],
};

class ViewVenueClass extends React.Component<ViewVenuePropsType, ViewVenueStateType> {

    static displayName = 'ViewVenue';

    constructor(props: Readonly<ViewVenuePropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        API.venues.id.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'venue',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
        API.venues.id.events.get(this.props.match.params.id).then((data) => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'events',
            )(data.result);
        }).catch((err) => {
            console.error(err);
            // TODO: error handling w/ notifs
        });
    }

    //
    private patch = (update: VenueUpdate) => {
        console.log(update);
        API.venues.id.patch(this.props.match.params.id, update).then(() => {
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
            // TODO: error handling w/ notifs
        });
    }

    render() {
        if (this.state.venue) {
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
                        onDelete: async () => {
                            try {
                                await API.venues.id.delete(this.props.match.params.id);
                                return true;
                            } catch (e) {
                                return false;
                            }
                        },
                    }}
                />
            );
        }
        return null;
    }
}

export const ViewVenue = withRouter(ViewVenueClass);
