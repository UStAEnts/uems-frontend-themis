import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import './IconBox.scss';
import { ColorUtilities } from '../../../utilities/ColorUtilities';

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
};

export function IconBox(props: IconBoxPropsType) {

    return (
        <div
            className="icon-box"
            style={{
                backgroundColor: props.color,
                color: ColorUtilities.determineForegroundColor(props.color),
            }}
        >
            <FontAwesomeIcon icon={props.icon} fixedWidth />
        </div>
    );

}

IconBox.defaultProps = {
    color: '#787878',
} as Partial<IconBoxPropsType>;
