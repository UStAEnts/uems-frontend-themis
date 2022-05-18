import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {API, EventResponse, VenueResponse} from '../../../utilities/APIGen';
import {loadAPIData} from '../../../utilities/DataUtilities';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import Venue from "./Venue";

export type ViewVenuePropsType = {} & RouteComponentProps<{
    id: string,
}> & NotificationPropsType;

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
            () => UIUtilities.tryShowPartialWarning(this),
        );
    }

    realRender() {
        if (this.state.venue) {
            return (<Venue venue={this.state.venue} events={this.state.events}/>);
        }
        return null;
    }
}

export const ViewVenue = withNotificationContext(withRouter(ViewVenueClass));
