import * as React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from '../../../utilities/ColorUtilities';

import './Button.scss';

export type ButtonPropsType = {
    icon?: IconDefinition,
    color: string,
    text: string,
    includeArrow: boolean,
    fullWidth: boolean,
};

export type ButtonStateType = {};

export function Button(props: ButtonPropsType) {
    const arrow = props.includeArrow ? <FontAwesomeIcon className="arrow" icon={faArrowRight} /> : null;
    const icon = props.icon === undefined ? <i style={{ height: '1em' }} />
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
