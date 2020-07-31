import React from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const withNotificationContext = <T extends React.Component<any, any, any>>(Component: T) => (
    (props: any) => (
        <NotificationContext.Consumer>
            {(context) => (
                // @ts-ignore - UNSAFE
                // eslint-disable-next-line react/jsx-props-no-spreading
                <Component notificationContext={context} {...props} />
            )}
        </NotificationContext.Consumer>
    )
);
