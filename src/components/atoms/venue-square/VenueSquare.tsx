import * as React from 'react';
import { Venue, VenueStatus } from '../../../types/Venue';
import { IconBox } from '../icon-box/IconBox';
import './VenueSquare.scss';
import { Theme } from '../../../theme/Theme';
import {faBuilding} from '@fortawesome/free-solid-svg-icons';

export type VenueSquareProps = {
    venue: Venue
}

export class VenueSquare extends React.Component<VenueSquareProps> {
    constructor(props: VenueSquareProps) {
        super(props);
        
    }

    static statusToColor(status: VenueStatus) {
        switch (status) {
            case VenueStatus.Open:
                return Theme.SUCCESS
            case VenueStatus.Closed:
                return Theme.GRAY_LIGHT
            case VenueStatus.Maintenance:
                return Theme.YELLOW
            case VenueStatus.Unknown:
                return Theme.WARNING
        }
    }

    render() {
        return (
            <div className="venue_square">
                <h1 className="venue_square_title">{this.props.venue.name}</h1>
                <IconBox icon={faBuilding} color={VenueSquare.statusToColor(this.props.venue.status)} />
            </div>
        )
    }
}