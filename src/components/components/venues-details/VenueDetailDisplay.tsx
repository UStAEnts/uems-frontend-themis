import * as React from 'react';
import { Venues } from '../../../pages/venues/Venues';
import { Venue } from '../../../types/Venue';

export type VenueDetailDisplayProps = {
    venue?: Venue
}

export class VenueDetailDisplay extends React.Component<VenueDetailDisplayProps>{
    constructor(props: VenueDetailDisplayProps) {
        super(props)
    }

    render() {
        return (
            <div className="venueDetailDisplay">
                {this.props.venue?.name}
            </div>
        )
    }
}