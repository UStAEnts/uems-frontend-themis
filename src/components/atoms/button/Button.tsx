import * as React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from '../../../utilities/ColorUtilities';

import './Button.scss';
import { CSSProperties } from 'react';
import { Theme } from '../../../theme/Theme';

export type ButtonPropsType = {
	/**
	 * The optional icon to be displayed to the left of the text on this button
	 */
	icon?: IconDefinition;
	/**
	 * The optional color code to be used for this button. Default prop provided
	 */
	color?: string;
	/**
	 * The text to display for this button
	 */
	text?: string;
	/**
	 * If the arrow on the right hand side of the text should be displayed in this button
	 */
	includeArrow?: boolean;
	/**
	 * If this button should span the full width of its container
	 */
	fullWidth?: boolean;
	/**
	 * Click listener
	 */
	onClick?: () => void;
	/**
	 * An optional name to apply to the button
	 */
	name?: string;
	/**
	 * Additional styles
	 */
	style?: CSSProperties;
	/**
	 * Optional children elements to place inside this button
	 */
	children?: React.ReactNode;
};

/**
 * Represents a HTML Button instance with additional properties. Renders down to a HTML button so can still be used in
 * forms but a distinct onClick handler is also provided
 * @param props the props as defined in {@link ButtonPropsType}
 * @constructor
 */
export function Button(props: ButtonPropsType) {
	const arrow = props.includeArrow ? (
		<FontAwesomeIcon className="arrow" icon={faArrowRight} />
	) : null;
	const icon =
		props.icon === undefined ? (
			<i style={{ height: '1em' }} />
		) : (
			<FontAwesomeIcon className="icon" icon={props.icon} fixedWidth />
		);

	const text = props.text ? (
		<div className="text">{props.text}</div>
	) : undefined;

	const buttonStyle = {
		backgroundColor: props.color ?? Theme.GRAY,
		color: ColorUtilities.determineForegroundColor(props.color ?? Theme.GRAY),
		...props.style,
	} as React.CSSProperties;

	return (
		<button
			className={`button ${props.fullWidth ? 'full-width' : ''}`}
			type="button"
			style={buttonStyle}
			onClick={props.onClick}
			name={props.name}
			aria-label={props.name}
		>
			{icon}
			{text}
			{arrow}
			{props.children}
		</button>
	);
}

Button.defaultProps = {
	includeArrow: false,
	fullWidth: false,
} as Partial<ButtonPropsType>;
