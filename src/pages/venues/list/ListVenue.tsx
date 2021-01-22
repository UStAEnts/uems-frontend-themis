import React from 'react';
import { API, VenueResponse } from '../../../utilities/APIGen';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';

export type ListVenuePropsType = {};

export type ListVenueStateType = {
    venues?: VenueResponse[],
} & FallibleReactStateType;

export class ListVenue extends FallibleReactComponent<ListVenuePropsType, ListVenueStateType> {

    static displayName = 'ListVenue';

    constructor(props: Readonly<ListVenuePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListVenueStateType>(
            [{
                params: [],
                stateName: 'venues',
                call: API.venues.get,
            }],
            this.setState.bind(this),
        );
    }

    realRender() {
        if (!this.state.venues) return null;

        const venues: GenericRecord<VenueResponse>[] = this.state.venues.map((e) => ({
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
                    render={genericRender<VenueResponse>(['user', 'date'])}
                />
            </div>
        );
    }
}
