import React, {CSSProperties} from "react";
import styles from './VenueChip.module.scss';
import {ColorUtilities} from "../../../utilities/ColorUtilities";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import { Venue } from "../../../utilities/APIPackageGen";

/**
 * The properties for a venue chip to render as a chip
 */
type VenueChipType = {
    /**
     * The venue which should be rendered in the chip
     */
    venue: Venue,
    /**
     * If the element should be rendered as a link to the venue page
     */
    link?: boolean,
    /**
     * Any additional styles to apply to the outermost element of the container
     */
    style?: CSSProperties,
    /**
     * Any additional class names to apply to the outermost element of the container
     */
    className?: string,
};

/**
 * Produces a venue chip with the name, capacity and background of the provided venue. If link is true then it will
 * return as a link to the venue page, if not it is returned as a div.
 * @param venue the venue which should be represented
 * @param link if the element should be represented as a link or a div
 * @param children the children of this element that should be rendered inside the element
 * @param rest the rest of the parameters from {@link VenueChipType}
 * @constructor
 */
const VenueChip: React.FunctionComponent<VenueChipType> = ({venue, link, children, ...rest}) => {
    const internal = <>
        <div className={styles.top}>{venue.name}</div>
        <div className={styles.bottom}>Capacity {venue.capacity}</div>
        {children}
    </>;

    const style = {
        backgroundColor: venue.color ?? '#000000',
        color: ColorUtilities.determineForegroundColor(venue.color ?? '#000000')
    };

    const classes = [styles.venueChip, rest.className].filter((e) => e !== undefined).join(' ');

    if (link) {
        return (<Link
            to={`/venues/${venue.id}`}
            className={classes}
            style={style}
        >
            {internal}
        </Link>)
    }

    return (
        <div className={classes} style={{...style, ...rest.style}}>
            {internal}
        </div>
    );
}

/**
 * The props for a venue chip extended with the onRemove handler for when the delete icon is pressed
 */
type RemovableVenueChipType = VenueChipType & {
    /**
     * To be called when the remove icon is clicked on the venue chip
     */
    onRemove?: () => void,
};

/**
 * Creates a {@link VenueChip} but with support for a cross icon on the right which when clicked will call the
 * {@link RemovableVenueChipType#onRemove} value if provided. The aesthetics are the same as the regular chip, just with
 * a cross.
 * @param props the properties of this venue chip
 * @constructor
 */
export const RemovableVenueChip: React.FunctionComponent<RemovableVenueChipType> = (props) => (
    <VenueChip venue={props.venue} link={props.link} className={styles.removable}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.icon} onClick={() => props.onRemove?.()}/>
    </VenueChip>
)

export default VenueChip;