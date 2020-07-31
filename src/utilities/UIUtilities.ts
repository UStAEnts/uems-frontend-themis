import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../context/NotificationContext';
import { Notification } from '../components/components/notification-renderer/NotificationRenderer';

export class UIUtilities {

    static tryShowNotification(
        context: NotificationContextType | undefined,
        title: string,
        description?: string,
        icon?: IconDefinition,
        color?: string,
        action?: Notification['action'],
    ) {
        if (context) {
            context.showNotification(
                title,
                description,
                icon,
                color,
                action,
            );
        } else {
            console.error('Notification system not enabled');
        }
    }

}
