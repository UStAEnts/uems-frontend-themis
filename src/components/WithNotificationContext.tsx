import React from "react"
import { NotificationContext } from "../context/NotificationContext";

export const withNotificationContext = <T extends React.Component<any, any, any>>(Component: T) => (
    (props: any) => (
        <NotificationContext.Consumer>
            {(context) => (
                // @ts-ignore - UNSAFE
                <Component notificationContext={context} {...props} />
            )}
        </NotificationContext.Consumer>
    )
)
