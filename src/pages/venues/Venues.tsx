import * as React from 'react';
import { VenuesLayout } from '../../components/components/venues-layout/VenuesLayout';
import { Venue, VenueStatus } from '../../types/Venue';
import './Venues.scss';

const TEMP_GENERATED_VENUES: Venue[] = [
    {
        _id: "1",
        name: "The StAge",
        status: VenueStatus.Closed
    },
    {
        _id: "2",
        name: "Rectors Cafe",
        status: VenueStatus.Open
    }
];

export class Venues extends React.Component {

    render() {
        return (
            <div className={`main-tab venues-page`}>
                <VenuesLayout venues={TEMP_GENERATED_VENUES}/>
            </div>
        )
    }
}