import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import './IconBox.scss';
import { ColorUtilities } from '../../../utilities/ColorUtilities';
import { CSSProperties } from "react";

export type IconBoxPropsType = {
    /**
     * The font awesome icon definition which should be used in this icon box
     * @required
     */
    icon: IconDefinition,
    /**
     * The color of this icon box. When not provided, it will default to #787878 (medium gray)
     */
    color: string,
    /**
     * Any additional style properties to attach to this icon box
     */
    style?: CSSProperties,
    /**
     * Any additional classes to add to this icon box
     */
    classes?: string,
};

/**
 * Represents a rounded rectangle box which contains a single font awesome icon as provided
 * @param props the properties as described by {@link IconBoxPropsType}
 * @constructor
 */
export function IconBox(props: IconBoxPropsType) {

    return (
        <div
            className={`icon-box ${props.classes ?? ''}`}
            style={{
                backgroundColor: props.color,
                color: ColorUtilities.determineForegroundColor(props.color),
                ...(props.style ?? {}),
            }}
        >
            <FontAwesomeIcon icon={props.icon} fixedWidth />
        </div>
    );

}

IconBox.defaultProps = {
    color: '#787878',
} as Partial<IconBoxPropsType>;
