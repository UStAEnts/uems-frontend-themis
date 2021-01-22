import { faSkullCrossbones, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../context/NotificationContext';
import { Notification } from '../components/components/notification-renderer/NotificationRenderer';
import { Theme } from "../theme/Theme";

type LoaderOptions = 'Audio' | 'BallTriangle' | 'Bars' | 'Circles' | 'Grid' | 'Hearts' | 'Oval' | 'Puff'
    | 'Rings' | 'TailSpin' | 'ThreeDots' | 'Watch' | 'RevolvingDot' | 'Triangle' | 'Plane' | 'MutatingDots'
    | 'None' | 'NotSpecified';

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

    static roundToDB(value: number, places: number) {
        return Math.round((value + Number.EPSILON) * (10 ** places)) / (10 ** places);
    }

    static sizeToHuman(size: number) {
        if (size < 1024) return `${size} bytes`;

        const kb = size / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        const tb = gb / 2024;

        if (tb >= 0.5) return `${this.roundToDB(tb, 2)} TiB`;
        if (gb >= 1) return `${this.roundToDB(gb, 2)} GiB`;
        if (mb >= 1) return `${this.roundToDB(mb, 2)} MiB`;
        return `${this.roundToDB(kb, 2)} KiB`;
    }

    static capitaliseFirst(value: string) {
        return value.charAt(0).toLocaleUpperCase() + value.substr(1);
    }

    static defaultSearch<T>(input: string | undefined, entries: T[], map: (value: T) => (string | undefined)[]): T[] {
        if (!input) return entries;

        const tokens = input.toLocaleLowerCase().split(' ');
        const mapping: [number, T][] = [];

        for (const option of entries) {
            let score = 0;
            const fields = map(option).map((e) => (e ? e.toLowerCase() : e));

            for (const token of tokens) {
                score += fields.map((e) => (e && e.includes(token) ? 1 : 0) as number).reduce((a, b) => (a + b));
            }

            mapping.push([score, option]);
        }

        const average = mapping.map(([score]) => score).reduce((prev, curr) => prev + curr) / mapping.length;
        const limit = average / 2;

        return mapping
            .filter(([score]) => score > limit)
            .sort(([aScore], [bScore]) => aScore - bScore)
            .map((a) => a[1]);
    }

    static randomLoaderType() {
        const types: LoaderOptions[] = ['Audio', 'BallTriangle', 'Bars', 'Circles', 'Grid', 'Hearts', 'Oval', 'Puff',
            'Rings', 'TailSpin', 'ThreeDots', 'Watch', 'Triangle', 'MutatingDots'];

        return types[Math.floor(Math.random() * types.length)];
    }

    static failedLoad(context: NotificationContextType | undefined, reason: string) {
        if (context) {
            try {
                context.showNotification(
                    'Failed to Load',
                    `There was an error: ${reason}`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
            } catch (e) {
                console.error('Notification system failed to send', e);
            }
        }
    }

}
