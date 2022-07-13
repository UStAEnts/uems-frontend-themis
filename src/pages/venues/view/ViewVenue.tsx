import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {loadAPIData} from '../../../utilities/DataUtilities';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import Venue from "./Venue";
import apiInstance, { EventList, Venue as UEMSVenue } from "../../../utilities/APIPackageGen";

export type ViewVenuePropsType = {} & RouteComponentProps<{
    id: string,
}> & NotificationPropsType;

export type ViewVenueStateType = {
    venue?: UEMSVenue,
    events?: EventList,
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
                    call: apiInstance.venues().id(this.props.match.params.id).get,
                    stateName: 'venue',
                    params: [],
                },
                {
                    call: apiInstance.venues().id(this.props.match.params.id).events().get,
                    stateName: 'events',
                    params: [],
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
