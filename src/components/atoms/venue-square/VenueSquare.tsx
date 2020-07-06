import * as React from 'react';
import { Venue } from '../../../types/Venue';


export type VenueSquareProps = {
    venue: Venue
}

export class VenueSquare extends React.Component<VenueSquareProps> {
    constructor(props: VenueSquareProps) {
        super(props);

    }

    render() {
        return (
            <div className="venue_square">
                venue_square
            </div>
        )
    }
}