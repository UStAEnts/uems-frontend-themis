declare module 'react-time-ago' {
	type ReactTimeAgoProps = {
		date: Date | number;
		locale?: string;
		locales?: string[];
		timeStyle?: string;
		tooltip?: boolean;
		formatVerboseDate?: (date: Date) => string;
		verboseDateFormat?: object;
		updateInterval?: number;
		tick?: boolean;
		container?: Function;
	};

	function ReactTimeAgo(props: ReactTimeAgoProps);

	export = ReactTimeAgo;
}
