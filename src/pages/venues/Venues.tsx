import * as React from 'react';
import { VenuesLayout } from '../../components/components/venues-layout/VenuesLayout';
import { VenueDetailDisplay } from '../../components/components/venues-details/VenueDetailDisplay';
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
        status: VenueStatus.Open
    },
    {
        _id: "5",
        name: "Club 601",
        status: VenueStatus.Open
    },
    {
        _id: "6",
        name: "The Mainbar",
        status: VenueStatus.Open
    },
    {
        _id: "7",
        name: "Club Lobby",
        status: VenueStatus.Open
    },
    {
        _id: "8",
        name: "Piazza",
        status: VenueStatus.Open
    },
    {
        _id: "9",
        name: "Garden",
        status: VenueStatus.Closed
    }
];

type VenuesState = {
    venue?: Venue
}

type VenuesProps = {

}

export class Venues extends React.Component<VenuesProps, VenuesState> {

    constructor(props: VenuesProps) {
        super(props);
        this.state = {
            venue: undefined
        }
    }

    onClick(venue: Venue) {
        console.log("Venue clicked: " + venue.name);
    }

    render_no_venue_selected() {
        return (
            <div className={`main-tab venues-page`}>
                <VenuesLayout venues={TEMP_GENERATED_VENUES} onClick = {this.onClick}/>
            </div>
        )
    }

    render_venue_selected() {
        return (
            <div className={`main-tab venues-page-selected`}>
                <VenuesLayout venues={TEMP_GENERATED_VENUES} onClick = {this.onClick}/>
                <VenueDetailDisplay venue={this.state.venue}/>
            </div>
        )
    }

    render() {
        return (this.state.venue === undefined) ? this.render_no_venue_selected() : this.render_venue_selected();
    }
}