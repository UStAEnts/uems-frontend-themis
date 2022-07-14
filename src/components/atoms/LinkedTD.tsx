import { Link } from 'react-router-dom';
import React from 'react';

export type LinkedTDProps = {
	to: string;
};

/**
 * A basic functional component that wraps the children within a TD element with a {@link Link} instance to the url
 * specified in the props
 * @param to the location to which the user should be redirected
 * @param children the children to put inside this TD element
 * @constructor
 */
export const LinkedTD: React.FunctionComponent<LinkedTDProps> = ({
	to,
	children,
}) => (
	<td>
		<Link to={to}>{children}</Link>
	</td>
);
