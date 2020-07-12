import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import { v4 } from "uuid";

import "./NotificationRenderer.scss"
import { IconBox } from "../../atoms/icon-box/IconBox";
import { Link } from "react-router-dom";

export type Notification = {
    id?: string,
    title: string,
    content?: string,
    icon?: IconDefinition,
    color?: string,
    state?: string,
    action?: {
        name: string,
        link?: string,
        onClick?: () => void,
    }
}

export type NotificationRendererPropsType = {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    notifications: Notification[],
}

/**
 * Applies IDs to notifications that are missing them
 * @param notifications the array of notifications to process
 * @param animationStates a set of states to apply to the notification by ID
 */
export function processNotifications(notifications: Notification[], animationStates?: { [key: string]: string }) {
    for (let notification of notifications) {
        if (notification.id === undefined) notification.id = v4();

        if (animationStates && Object.prototype.hasOwnProperty.call(animationStates, notification.id)) {
            notification.state = animationStates[notification.id];
        }
    }

    return notifications;
}

export class NotificationRenderer extends React.Component<NotificationRendererPropsType, {}> {

    static displayName = "NotificationRenderer";

    /**
     * Renders a notification object with
     * @param notification
     */
    private makeNotification = (notification: Notification) => {
        if (notification.icon === undefined) {
            return (
                <div className={`notification ${notification.state || ''}`} key={notification.id}>
                    <div className="content">
                        <div className="rest">
                            <div className="title">{notification.title}</div>
                            {
                                notification.content
                                    ? <div className="content">{notification.content}</div>
                                    : undefined
                            }
                        </div>
                        <div
                            className="accent"
                            style={{
                                backgroundColor: notification.color ? notification.color : undefined
                            }}
                        />
                    </div>
                    {
                        notification.action
                            ? (
                                <div className="action" onClick={notification.action.onClick}>
                                    {
                                        notification.action.link
                                            ? <Link to={"/"}>{notification.action.name}</Link>
                                            : <span>{notification.action.name}</span>
                                    }
                                </div>
                            )
                            : undefined
                    }
                </div>
            )
        } else {
            return (
                <div className={`notification with-icon ${notification.state || ''}`} key={notification.id}>
                    <div className="content">
                        <div className="rest">
                            <div className="left">

                                <div className="title">{notification.title}</div>
                                {
                                    notification.content
                                        ? <div className="content">{notification.content}</div>
                                        : undefined
                                }
                            </div>
                            <div className="right">
                                <IconBox icon={notification.icon} color={notification.color || '#000000'} />
                            </div>
                        </div>
                        <div
                            className="accent"
                            style={{
                                backgroundColor: notification.color ? notification.color : undefined
                            }}
                        />
                    </div>
                    {
                        notification.action
                            ? (
                                <div className="action" onClick={notification.action.onClick}>
                                    {
                                        notification.action.link
                                        ? <Link to={"/"}>{notification.action.name}</Link>
                                        : <span>{notification.action.name}</span>
                                    }
                                </div>
                            )
                            : undefined
                    }
                </div>
            )
        }
    }

    render() {
        return (
            <div className={`notification-renderer ${this.props.position}`}>
                {this.props.notifications.map(this.makeNotification)}
            </div>
        );
    }

};
