import * as React from 'react';
import {DateRangePicker} from 'react-dates';
import moment, {Moment} from 'moment';
import {TextField} from '../../atoms/text-field/TextField';
import 'react-dates/lib/css/_datepicker.css';
import {KeyValueOption, Select} from '../../atoms/select/Select';

import './Filter.scss';

export type FilterConfiguration = {
	/**
	 * The name of this filter
	 */
	name: string;
	/**
	 * The type of filter to be applied. Number and search map to input fields, option maps to a select box and date
	 * maps to an AirBnb date range selector
	 */
	type: 'number' | 'option' | 'date' | 'search';
	/**
	 * The initial value with which to populate the field
	 */
    value?: number | string | { startDate: Date, endDate: Date } | KeyValueOption,
	/**
	 * The options to be displayed in  the options menu if relevant
	 */
	options?: string[] | KeyValueOption[];
	/**
	 * The maximum value allowed where relevant
	 */
	max?: number | Date;
	/**
	 * The minimum value allowed where relevant
	 */
	min?: number | Date;
};

export type FilterPropsType = {
	/**
	 * The set of possible filters to be displayed in this bar
	 */
	filters: {
		[key: string]: FilterConfiguration;
	};
	/**
	 * The optional function to be called when a filter is changed. It contains all the filters currently in use if
	 * they have had a value provided
	 * @param filters all filters currently in use with their current state
	 */
	onFilterChange?: (filters: {
        [key: string]: FilterConfiguration,
    }) => void,
}

export type DateFilterStatus = {
	/**
	 * The start date of the filter range. If null the user has not selected a date
	 */
	startDate: Moment | null;
	/**
	 * The end date of the filter range. If null the user has not selected a date
	 */
	endDate: Moment | null;
	/**
	 * If set it holds the currently focused field of the date range selector
	 */
	focusedInput?: 'startDate' | 'endDate' | null;
};

export type NumberFilterStatus = {
	/**
	 * The current value in the input field if one has been specified
	 */
	value?: number;
};

export type SelectFilterStatus = {
	/**
	 * The currently selected option from the select input
	 */
	selectedOption: string | KeyValueOption;
};

export type SearchFilterStatus = {
	/**
	 * The current value in the search field
	 */
	content: string;
};

export type FilterStateType = {
	/**
	 * Contains the current state of all date filters in use
	 */
	dateFilterStates: {
		[key: string]: DateFilterStatus;
	};
	/**
	 * Contains the current state of all the number filters in use
	 */
	numberFilterStates: {
		[key: string]: NumberFilterStatus;
	};
	/**
	 * Contains the current state of all the select filters in use
	 */
	selectFilterStates: {
		[key: string]: SelectFilterStatus;
	};
	/**
	 * Contains the current state of all the search filters in use
	 */
	searchFilterStates: {
		[key: string]: SearchFilterStatus;
	};
};

// focusedInput?: 'startDate' | 'endDate' | null
export class Filter extends React.Component<FilterPropsType, Record<string, 'startDate' | 'endDate' | null>> {

	static displayName = 'Filter';

	constructor(props: Readonly<FilterPropsType>) {
		super(props);

        this.state = {};

        // this.state = {
        //     dateFilterStates: {},
        //     numberFilterStates: {},
        //     selectFilterStates: {},
        //     searchFilterStates: {},
        // };

		const bindFunctions: Function[] = [
			this.updateDateInput,
			this.updateDateFocus,
			this.updateSelectInput,

			this.makeNumberInput,
			this.makeSelectInput,
			this.makeDateInput,
			this.makeSearchInput,
			this.notify,
		];

		for (let func of bindFunctions) {
			func = func.bind(this);
		}
	}

	/**
	 * Notifies the handler function if one has been specified by merging together all the active states
	 */
    private notify(values: Record<string, FilterConfiguration>) {
		if (this.props.onFilterChange) {
            this.props.onFilterChange(values);
            // this.props.onFilterChange({
            //     ...this.state.searchFilterStates,
            //     ...this.state.selectFilterStates,
            //     ...this.state.numberFilterStates,
            //     ...this.state.dateFilterStates,
            // });
		}
	}

	/**
	 * Updates the select input by placing it into the active state if it is the first time it is being updated or
	 * just updated if it is already specified
	 * @param key the key of the select filter
	 * @param option the value that has been selected
	 */
	private updateSelectInput(key: string, option: string | KeyValueOption) {
        const s = {...this.props.filters};

        if (Object.prototype.hasOwnProperty.call(s, key)) {
            s[key].value = option;
        }

        this.notify(s);
	}

	/**
	 * Updates the search input by placing it into the active state if it is the first time it is being updated or
	 * just updated if it is already specified
	 * @param key the key of the search filter
	 * @param value the value that has been entered
	 */
	private updateSearchInput(key: string, value: string) {
        const s = {...this.props.filters};

        if (Object.prototype.hasOwnProperty.call(s, key)) {
            s[key].value = value;
        }

        this.notify(s);
	}

	/**
	 * Produces a {@link Select} component containing the name of this filter as the placeholder, the options provided
	 * and a select listener which updates the state.
	 * @param key the key of this filter to be used as the select name
	 * @param select the select filter configuration
	 */
	private makeSelectInput(key: string, select: FilterConfiguration) {
		if (
			select.options &&
			select.options.length > 0 &&
			typeof select.options[0] === 'string'
		) {
			return (
				<div key={key} className="indv-filter">
					<Select
						placeholder={select.name}
						name={key}
						options={(select.options || []) as string[]}
						onSelectListener={(option: string) =>
							this.updateSelectInput(key, option)
						}
						initialOption={
                            Object.prototype.hasOwnProperty.call(this.props.filters, key)
                                ? this.props.filters[key].value as string
								: undefined
						}
					/>
				</div>
			);
		}
		return (
			<div key={key} className="indv-filter">
				<Select
					placeholder={select.name}
					name={key}
					options={(select.options || []) as KeyValueOption[]}
					onSelectListener={(option: string | KeyValueOption) =>
						this.updateSelectInput(key, option)
					}
					initialOption={
                        Object.prototype.hasOwnProperty.call(this.props.filters, key)
                            ? this.props.filters[key].value as KeyValueOption
							: undefined
					}
				/>
			</div>
		);
	}

	/**
	 * Updates the number input by placing it into the active state if it is the first time it is being updated or
	 * just updated if it is already specified
	 * @param key the key of the number filter
	 * @param value the value that has been entered
	 */
	private updateNumberInput(key: string, value: string | number) {
		try {
			const newVal = typeof value === 'number' ? value : parseInt(value, 10);

            const s = {...this.props.filters};

            if (Object.prototype.hasOwnProperty.call(s, key)) {
                s[key].value = newVal;
            }

            this.notify(s);
		} catch (e) {
			console.log('Failed to parse as a number!!!');
			// TODO: Fix;
		}
	}

	/**
	 * Produces a number input copying in the state if present and the min and max values if provided. This will return
	 * a {@link TextField} with the set properties and a listener which will update the state
	 * @param key the key of this filter to be used as the name for the text and to update the state
	 * @param number the number filter configuration
	 */
	private makeNumberInput(key: string, number: FilterConfiguration) {
		const spreadProps: any = {
            ...(Object.prototype.hasOwnProperty.call(this.props.filters, key)
                ? this.props.filters[key]
				: {}),
		};

		if (!(number.max instanceof Date)) spreadProps.max = number.max;
		if (!(number.min instanceof Date)) spreadProps.min = number.min;

		return (
			<div className="indv-filter">
				<TextField
					name={key}
					type="number"
					placeholder={number.name}
					onChange={(val: number) => this.updateNumberInput(key, val)}
					/* eslint-disable-next-line react/jsx-props-no-spreading */
					{...spreadProps}
				/>
			</div>
		);
	}

	/**
	 * Updates the date input focus by placing it into the active state if it is the first time it is being updated or
	 * just updated if it is already specified
	 * @param key the key of the date filter
	 * @param focus the currently focused element
	 */
	private updateDateFocus(key: string, focus: 'startDate' | 'endDate' | null) {
        this.setState((s) => ({...s, [key]: focus}));
        // const s = {...this.props.filters};
        //
        // if (Object.prototype.hasOwnProperty.call(s, key)) {
        //     s[key].value = focus;
        // }
        //
        // this.notify(s);
        // this.setState((oldState) => {
        //     const s = {...oldState};
        //
        //     if (Object.prototype.hasOwnProperty.call(s.dateFilterStates, key)) {
        //         s.dateFilterStates[key].focusedInput = focus;
        //     } else {
        //         s.dateFilterStates[key] = {
        //             startDate: null,
        //             endDate: null,
        //             focusedInput: focus,
        //         };
        //     }
        //
        //     this.notify();
        //
        //     return s;
        // });
	}

	/**
	 * Updates the date input by placing it into the active state if it is the first time it is being updated or
	 * just updated if it is already specified
	 * @param key the key of the date filter
	 * @param start the select start time or null if one is not set
	 * @param end the select end time or null if one is not set
	 */
    private updateDateInput(key: string, start: Moment | null, end: Moment | null) {
        const s = {...this.props.filters};

        if (Object.prototype.hasOwnProperty.call(s, key)) {
            if (start && end)
                s[key].value = {startDate: start.toDate(), endDate: end.toDate()};
        }

        this.notify(s);

        // this.setState((oldState) => {
        //     const s = {...oldState};
        //
        //     if (Object.prototype.hasOwnProperty.call(s.dateFilterStates, key)) {
        //         s.dateFilterStates[key] = {
        //             ...(s.dateFilterStates[key]),
        //             startDate: start,
        //             endDate: end,
        //         };
        //     } else {
        //         s.dateFilterStates[key] = {
        //             startDate: start,
        //             endDate: end,
        //             focusedInput: null,
        //         };
        //     }
        //
        //     return s;
        // });
	}

	/**
	 * Produces a date input respecting the min and max values provided if relevant and returns an airbnb date range
	 * picker
	 * @param key the key of this filter to update the state
	 * @param date the date configuration currently in use
	 */
	private makeDateInput(key: string, date: FilterConfiguration) {
		let spreadProperties: any = {};

		if (date.min instanceof Date) spreadProperties.minDate = moment(date.min);
		if (date.max instanceof Date) spreadProperties.maxDate = moment(date.max);

        if (Object.prototype.hasOwnProperty.call(this.props.filters, key)) {
            spreadProperties = {...this.props.filters[key]};
            delete spreadProperties['name'];
            delete spreadProperties['type'];
            delete spreadProperties['value'];
		}

		let initial = undefined;
		let initialEnd = undefined;
        if (typeof (date.value) === 'object' && 'startDate' in date.value) {
            initial = moment(date.value.startDate);
            initialEnd = moment(date.value.endDate);
		}

		return (
			<div key={key} className="indv-filter">
				<div className="label">{date.name}</div>
				<DateRangePicker
					startDate={initial}
					endDate={initialEnd}
					enableOutsideDays
					isOutsideRange={() => false}
					onDatesChange={(change) => {
						//@ts-ignore : TODO: deal with this later?
						this.updateDateInput(key, change.startDate, change.endDate);
					}}
					onFocusChange={(focus) => this.updateDateFocus(key, focus)}
                    focusedInput={this.state[key] ?? null}
					startDateId="start-date-id"
					endDateId="end-date-id"
					displayFormat="DD/MM/yyyy"
					/* eslint-disable-next-line react/jsx-props-no-spreading */
					{...spreadProperties}
				/>
			</div>
		);
	}

	/**
	 * Makes a search input which is a {@link TextField} which updates the state on entry
	 * @param key the key of this filter which will be used to update the state
	 * @param search the search configuration
	 */
	private makeSearchInput(key: string, search: FilterConfiguration) {
        const initialContent = Object.prototype.hasOwnProperty.call(this.props.filters, key)
            ? this.props.filters[key].value as string
			: undefined;

		return (
			<div key={key} className="indv-filter">
				<TextField
					name={key}
					type="text"
					placeholder={search.name}
					initialContent={initialContent}
					onChange={(val) => this.updateSearchInput(key, val)}
				/>
			</div>
		);
	}

	render() {
		const filters = Object.entries(this.props.filters).map((entry) => {
			const [key, config] = entry;

			switch (config.type) {
				case 'date':
					return this.makeDateInput(key, config);
				case 'number':
					return this.makeNumberInput(key, config);
				case 'option':
					return this.makeSelectInput(key, config);
				case 'search':
					return this.makeSearchInput(key, config);
				default:
					return undefined;
			}
		});
		return <div className="filter">{filters}</div>;
	}
}
