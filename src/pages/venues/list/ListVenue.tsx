import React from 'react';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import apiInstance, { Venue } from "../../../utilities/APIPackageGen";

export type ListVenuePropsType = {} & NotificationPropsType;

export type ListVenueStateType = {
    venues?: Venue[],
} & FallibleReactStateType;

class ListVenueClass extends FallibleReactComponent<ListVenuePropsType, ListVenueStateType> {

    static displayName = 'ListVenue';

    constructor(props: Readonly<ListVenuePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListVenueStateType>(
            [{
                params: [{}],
                stateName: 'venues',
                call: apiInstance.venues().get,
            }],
            this.setState.bind(this),
            () => UIUtilities.tryShowPartialWarning(this),
        );
    }

    realRender() {
        if (!this.state.venues) return null;

        const venues: GenericRecord<Venue>[] = this.state.venues.map((e) => ({
            identifier: e.id,
            target: `/venues/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-venues" style={{ padding: '30px' }}>
                <h1>Venues</h1>
                <GenericList
                    records={venues}
                    dontPad
                    render={genericRender<Venue>(['user'])}
                />
            </div>
        );
    }
}

export const ListVenue = withNotificationContext(ListVenueClass);