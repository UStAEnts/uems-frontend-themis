import React from 'react';
import { NotificationContext } from '../context/NotificationContext';

export function withNotificationContext<
	P extends any,
	C extends React.ComponentType<P>
>(Component: C & React.ComponentType<P>) {
	return (props: any) => (
		<NotificationContext.Consumer>
			{(context) => (
				// @ts-ignore - UNSAFE
				// eslint-disable-next-line react/jsx-props-no-spreading
				<Component notificationContext={context} {...props} />
			)}
		</NotificationContext.Consumer>
	);
}
