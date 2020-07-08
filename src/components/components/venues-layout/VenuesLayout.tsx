import * as React from 'react';
import './VenuesLayout.scss';
import { Venue } from '../../../types/Venue';
import { VenueSquare } from '../../atoms/venue-square/VenueSquare';

type VenuesLayoutProps = {
    venues: Venue[],
    onClick: Function,
}

type VenueLayoutState = {
    collapsed: boolean
}

export class VenuesLayout extends React.Component<VenuesLayoutProps, VenueLayoutState> {

    constructor(props: VenuesLayoutProps) {
        super(props);
        this.state = {
            collapsed: true
        }
    }

    collapsed_render() {
        return (
            <div className="venues_layout_collapsed">
                {this.props.venues.map((v) => VenuesLayout.venueToSquare(v, true, this.props.onClick))}
            </div>
        )
    }

    expanded_render() {
        return (
            <div className="venues_layout_expanded">
                {this.props.venues.map((v) => VenuesLayout.venueToSquare(v, false, this.props.onClick))}
            </div>
        )
    }

    render() {
        return (
            this.state.collapsed ? this.collapsed_render(): this.expanded_render()
        );
    }

    static venueToSquare(venue: Venue, collapsed: boolean, onClick: Function) {
        return (
            <VenueSquare venue={venue} collapsed={collapsed} onClick={onClick}/>
        )
    }
}