import {
	faAdjust,
	faSkullCrossbones,
	IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {
	NotificationContextType,
	NotificationPropsType,
} from '../context/NotificationContext';
import { Notification } from '../components/components/notification-renderer/NotificationRenderer';
import { Theme } from '../theme/Theme';
import axios, { AxiosError } from 'axios';
import apiInstance, { UEMSResponse } from './APIPackageGen';

type LoaderOptions =
	| 'Audio'
	| 'BallTriangle'
	| 'Bars'
	| 'Circles'
	| 'Grid'
	| 'Hearts'
	| 'Oval'
	| 'Puff'
	| 'Rings'
	| 'TailSpin'
	| 'ThreeDots'
	| 'Watch'
	| 'RevolvingDot'
	| 'Triangle'
	| 'Plane'
	| 'MutatingDots'
	| 'None'
	| 'NotSpecified';

export class UIUtilities {
	static tryShowPartialWarning(
		props:
			| { notificationContext?: NotificationContextType }
			| { props: { notificationContext?: NotificationContextType } }
	) {
		let context: NotificationContextType | undefined;
		if (Object.prototype.hasOwnProperty.call(props, 'notificationContext'))
			context = (props as any).notificationContext;
		else context = (props as any).props.notificationContext;

		UIUtilities.tryShowNotification(
			context,
			'Data might be incomplete',
			'Some queries are only returning partial results. This means some data may be corrupted and cannot' +
				' return successfully. Please inform a system admin as soon as possible to manually correct invalid' +
				' data.',
			faAdjust,
			Theme.TEAL
		);
	}

	static tryShowNotification(
		context: NotificationContextType | undefined,
		title: string,
		description?: string,
		icon?: IconDefinition,
		color?: string,
		action?: Notification['action']
	) {
		if (context) {
			context.showNotification(title, description, icon, color, action);
		} else {
			console.error('Notification system not enabled');
		}
	}

	static roundToDB(value: number, places: number) {
		return Math.round((value + Number.EPSILON) * 10 ** places) / 10 ** places;
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

	static defaultSearch<T>(
		input: string | undefined,
		entries: T[],
		map: (value: T) => (string | undefined)[]
	): T[] {
		if (!input) return entries;

		const tokens = input.toLocaleLowerCase().split(' ');
		const mapping: [number, T][] = [];

		for (const option of entries) {
			let score = 0;
			const fields = map(option).map((e) => (e ? e.toLowerCase() : e));

			for (const token of tokens) {
				score += fields
					.map((e) => (e && e.includes(token) ? 1 : 0) as number)
					.reduce((a, b) => a + b);
			}

			mapping.push([score, option]);
		}

		const average =
			mapping.map(([score]) => score).reduce((prev, curr) => prev + curr) /
			mapping.length;
		const limit = average / 2;

		return mapping
			.filter(([score]) => score > limit)
			.sort(([aScore], [bScore]) => aScore - bScore)
			.map((a) => a[1]);
	}

	static randomLoaderType() {
		const types: LoaderOptions[] = [
			'Audio',
			'BallTriangle',
			'Bars',
			'Circles',
			'Grid',
			'Hearts',
			'Oval',
			'Puff',
			'Rings',
			'TailSpin',
			'ThreeDots',
			'Watch',
			'Triangle',
			'MutatingDots',
		];

		return types[Math.floor(Math.random() * types.length)];
	}

	static failedLoad(
		context: NotificationContextType | undefined,
		reason: string
	) {
		if (context) {
			try {
				context.showNotification(
					'Failed to Load',
					`There was an error: ${reason}`,
					faSkullCrossbones,
					Theme.FAILURE
				);
			} catch (e) {
				console.error('Notification system failed to send', e);
			}
		}
	}

	static load<T>(
		context: NotificationContextType | NotificationPropsType,
		response: Promise<UEMSResponse<T>>,
		error?: string | ((error: string) => string)
	): { data: (handler: (data: T) => void) => void } {
		let realHandler: ((data: T) => void) | undefined;
		let data: 'failed' | undefined | T;
		const wrapper = (handler: (data: T) => void) => {
			if (data !== 'failed' && data !== undefined) handler(data);
			else realHandler = handler;
		};

		let realContext: NotificationContextType | undefined;
		if ('notificationContext' in context) {
			realContext = context.notificationContext;
		} else if ('showNotification' in context) {
			realContext = context;
		}

		console.log('Load was called');
		response
			.then((result) => {
				if (result.status === 'FAILED') {
					let errorString = `There was an error fetching data from the server: ${result.error}. If you believe you have received this in error, please contact a member of support!`;
					if (typeof error === 'string') errorString = error;
					else if (typeof error === 'function')
						errorString = error(result.error);

					UIUtilities.tryShowNotification(
						realContext,
						'Failed to perform request',
						errorString,
						faSkullCrossbones,
						Theme.RED
					);
				} else {
					if (result.status === 'PARTIAL')
						UIUtilities.tryShowPartialWarning({
							notificationContext: realContext,
						});
					if (realHandler) realHandler(result.result);
				}
			})
			.catch((e) => {
				let message: string = 'An unknown error occurred';
				if (e instanceof Error) {
					message = e.message;
				}

				let errorString = `There was an error fetching data from the server: ${message}. If you believe you have received this in error, please contact a member of support!`;
				if (typeof error === 'string') errorString = error;
				else if (typeof error === 'function') errorString = error(message);

				UIUtilities.tryShowNotification(
					realContext,
					'Failed to perform request',
					errorString,
					faSkullCrossbones,
					Theme.RED
				);
			});

		return { data: wrapper };
	}

	static loadUnwrapped<
		Z,
		T extends
			| { status: 'OK' | 'PARTIAL'; result: Z }
			| { status: 'FAILED'; error: string }
	>(
		context: NotificationContextType | NotificationPropsType,
		response: Promise<T>,
		error?: string | ((error: string) => string)
	): { data: (handler: (data: T) => void) => void } {
		let realHandler: ((data: T) => void) | undefined;
		let data: 'failed' | undefined | T;
		const wrapper = (handler: (data: T) => void) => {
			if (data !== 'failed' && data !== undefined) handler(data);
			else realHandler = handler;
		};

		response.then((result) => {
			let realContext: NotificationContextType | undefined;
			if ('notificationContext' in context) {
				realContext = context.notificationContext;
			} else if ('showNotification' in context) {
				realContext = context;
			}

			if (result.status === 'FAILED' && 'error' in result) {
				let errorString = `There was an error fetching data from the server: ${
					(result as any).error
				}. If you believe you have received this in error, please contact a member of support!`;
				if (typeof error === 'string') errorString = error;
				else if (typeof error === 'function')
					errorString = error((result as any).error);

				UIUtilities.tryShowNotification(
					realContext,
					'Failed to perform request',
					errorString,
					faSkullCrossbones,
					Theme.RED
				);
			} else {
				if (result.status === 'PARTIAL')
					UIUtilities.tryShowPartialWarning({
						notificationContext: realContext,
					});
				if (realHandler) realHandler(result);
			}
		});

		return { data: wrapper };
	}

	static async deleteWith409Support(
		handler: () => Promise<any>
	): Promise<boolean> {
		try {
			await handler();
			return true;
		} catch (e) {
			if (axios.isAxiosError(e)) {
				const ae: AxiosError = e;
				if (ae.response && ae.response.status === 409) {
					throw new Error(ae.response.data.error.message);
				} else {
					console.error(
						'Failed to delete entity due to an unspecified error',
						e
					);
				}
			} else {
				console.error(
					'Failed to delete entity due to an unspecified, non axios error',
					e
				);
			}
			throw e;
		}
	}
}

export function classes(...classes: (string | undefined)[]) {
	return classes.filter((e) => e !== undefined).join(' ');
}
