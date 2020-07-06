import * as React from 'react';
import './VenueSquare.scss';
import { Venue, VenueStatus } from '../../../types/Venue';
import { IconBox } from '../icon-box/IconBox';
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
                return Theme.OK
            case VenueStatus.Closed:
                return Theme.UNAVAILABLE
            case VenueStatus.Maintenance:
                return Theme.MAINTENANCE
            case VenueStatus.Unknown:
                return Theme.UNKNOWN
        }
    }

    getStatusCssClass() {
        switch (this.props.venue.status) {
            case VenueStatus.Open:
                return "venue-ok"
            case VenueStatus.Closed:
                return "venue-closed"
            case VenueStatus.Maintenance:
                return "venue-maintenance"
            case VenueStatus.Unknown:
                return "venue-unknown"
        }
    }
    
    render() {
        return (
            <div className={this.getStatusCssClass()}>
                <h1 className="venue_square_title">{this.props.venue.name}</h1>
                <IconBox icon={faBuilding} color={VenueSquare.statusToColor(this.props.venue.status)} />
            </div>
        )
    }
}