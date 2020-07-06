import * as React from 'react';
import {Venue} from '../../../types/Venue';
import { VenueSquare } from '../../atoms/venue-square/VenueSquare';

type VenuesLayoutProps = {
    venues: Venue[]
}

export class VenuesLayout extends React.Component<VenuesLayoutProps> {
    venueToSquare(venue: Venue) {
        return (
            <VenueSquare venue={venue}/>
        )
    }

    render() {
        return (
            <div className="venues_layout">
                {this.props.venues.map(this.venueToSquare)}
            </div>
        )
    }
}