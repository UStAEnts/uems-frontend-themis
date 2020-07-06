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
    },
    {
        _id: "3",
        name: "Sandys Bar",
        status: VenueStatus.Maintenance
    },
    {
        _id: "4",
        name: "Beacon Bar",
        status: VenueStatus.Unknown
    },
    {
        _id: "5",
        name: "Club 601",
        status: VenueStatus.Unknown
    },
    {
        _id: "6",
        name: "The Mainbar",
        status: VenueStatus.Unknown
    },
    {
        _id: "7",
        name: "Club Lobby",
        status: VenueStatus.Unknown
    },
    {
        _id: "8",
        name: "Piazza",
        status: VenueStatus.Unknown
    },
    {
        _id: "9",
        name: "Garden",
        status: VenueStatus.Unknown
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