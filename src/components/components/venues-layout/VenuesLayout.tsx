import * as React from 'react';
import {Venue} from '../../../types/Venue';

type VenuesLayoutProps = {
    venues: Venue[]
}

export class VenuesLayout extends React.Component<VenuesLayoutProps> {
    render() {
        return (
            <div className="venues_layout">
                this.props.venues
            </div>
        )
    }
}