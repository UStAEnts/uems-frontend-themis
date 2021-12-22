import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { API, EventResponse, VenueResponse, VenueUpdate } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { EventOrCommentRelatedView } from '../../../components/components/event-related-view/EventOrCommentRelatedView';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import axios, {AxiosError} from "axios";

export type ViewVenuePropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewVenueStateType = {
    venue?: VenueResponse,
    events?: EventResponse[],
} & FallibleReactStateType;

class ViewVenueClass extends FallibleReactComponent<ViewVenuePropsType, ViewVenueStateType> {

    static displayName = 'ViewVenue';

    constructor(props: Readonly<ViewVenuePropsType>) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ViewVenueStateType>(
            [
                {
                    call: API.venues.id.get,
                    stateName: 'venue',
                    params: [this.props.match.params.id],
                },
                {
                    call: API.venues.id.events.get,
                    stateName: 'events',
                    params: [this.props.match.params.id],
                },
            ],
            this.setState.bind(this),
        );
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

    realRender() {
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
                                if (axios.isAxiosError(e)){
                                    const ae: AxiosError = e;
                                    if (ae.response && ae.response.status === 409){
                                        throw new Error(ae.response.data.error.message);
                                    }
                                }
                                console.error('failure', e);
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
