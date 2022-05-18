import React from "react";
import {VenueResponse} from "../../../utilities/APIGen";
import styles from './VenueChip.module.scss';
import {ColorUtilities} from "../../../utilities/ColorUtilities";
import {Link} from "react-router-dom";

/**
 * Produces a venue chip with the name, capacity and background of the provided venue. If link is true then it will
 * return as a link to the venue page, if not it is returned as a div.
 * @param venue the venue which should be represented
 * @param link if the element should be represented as a link or a div
 * @constructor
 */
const VenueChip: React.FunctionComponent<{ venue: VenueResponse, link?: boolean }> = ({venue, link}) => {
    const internal = [
        (<div className={styles.top}>{venue.name}</div>),
        (<div className={styles.bottom}>Capacity {venue.capacity}</div>),
    ];

    const style = {
        backgroundColor: venue.color ?? '#000000',
        color: ColorUtilities.determineForegroundColor(venue.color ?? '#000000')
    };

    if (link) {
        return (<Link to={`/venues/${venue.id}`} className={styles.venueChip} style={style}>
            {internal}
        </Link>)
    }

    return (
        <div className={styles.venueChip} style={style}>
            {internal}
        </div>
    );
}

export default VenueChip;