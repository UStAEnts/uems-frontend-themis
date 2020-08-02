import React from 'react';
import { API, VenueResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';

export type ListVenuePropsType = {};

export type ListVenueStateType = {
    venues?: VenueResponse[],
};

export class ListVenue extends React.Component<ListVenuePropsType, ListVenueStateType> {

    static displayName = 'ListVenue';

    constructor(props: Readonly<ListVenuePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.venues.get().then((data) => failEarlyStateSet(this.state, this.setState.bind(this), 'venues')(data.result))
            .catch((err) => console.error(err));
    }

    render() {
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
