import * as React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from '../../../utilities/ColorUtilities';

import './Button.scss';

export type ButtonPropsType = {
    /**
     * The optional icon to be displayed to the left of the text on this button
     */
    icon?: IconDefinition,
    /**
     * The optional color code to be used for this button. Default prop provided
     */
    color: string,
    /**
     * The text to display for this button
     */
    text: string,
    /**
     * If the arrow on the right hand side of the text should be displayed in this button
     */
    includeArrow?: boolean,
    /**
     * If this button should span the full width of its container
     */
    fullWidth?: boolean,
    /**
     * Click listener
     */
    onClick?: () => void,
    /**
     * An optional name to apply to the button
     */
    name?: string;
};

/**
 * Represents a HTML Button instance with additional properties. Renders down to a HTML button so can still be used in
 * forms but a distinct onClick handler is also provided
 * @param props the props as defined in {@link ButtonPropsType}
 * @constructor
 */
export function Button(props: ButtonPropsType) {
    const arrow = props.includeArrow ? <FontAwesomeIcon className="arrow" icon={faArrowRight} /> : null;
    const icon = props.icon === undefined
        ? <i style={{ height: '1em' }} />
        : <FontAwesomeIcon className="icon" icon={props.icon} fixedWidth />;

    const buttonStyle = {
        backgroundColor: props.color,
        color: ColorUtilities.determineForegroundColor(props.color),
    } as React.CSSProperties;

    if (props.fullWidth) {
        buttonStyle.width = '100%';
    }

    return (
        <button
            className="button"
            type="button"
            style={buttonStyle}
            onClick={props.onClick}
            name={props.name}
            aria-label={props.name}
        >
            {icon}
            <div className="text">{props.text}</div>
            {arrow}
        </button>
    );
}

Button.defaultProps = {
    color: '#aeaeae',
    includeArrow: false,
    fullWidth: false,
} as Partial<ButtonPropsType>;
