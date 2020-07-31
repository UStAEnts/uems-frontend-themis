import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Notification } from '../components/components/notification-renderer/NotificationRenderer';

export type NotificationContextType = {
    /**
     * Show a notification in the global state
     * @param title the title of the notification
     * @param content the content body of the notification
     * @param icon the option font awesome icon to show next to the message
     * @param color the emphasis color of the notification
     * @return the ID of the notification which can be used to cancel it
     */
    showNotification: (
        title: string,
        content?: string,
        icon?: IconDefinition,
        color?: string,
        action?: Notification['action']
    ) => string,
    /**
     * Clears all notifications currently being displayed. Returns the number of notifications that
     * were removed from the screen
     */
    clearNotifications: () => number,
    /**
     * Clears a specific notification from their ID
     * @param id the id of the notification to remove as returned by {@link NotificationContextType#showNotification}
     * @return if the notification was removed successfully
     */
    clearNotification: (id: string) => boolean,
}

/**
 * Default notification context which throws an error on all functions
 */
const defaultValue: NotificationContextType = {
    showNotification: () => {
        throw new Error('Context is not initialised');
    },
    clearNotification: () => {
        throw new Error('Context is not initialised');
    },
    clearNotifications: () => {
        throw new Error('Context is not initialised');
    },
};

export const NotificationContext = React.createContext(defaultValue);
