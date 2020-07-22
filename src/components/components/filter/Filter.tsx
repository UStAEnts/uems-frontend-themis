import * as React from 'react';
import { DateRangePicker } from 'react-dates';
import moment, { Moment } from 'moment';
import { TextField } from '../../atoms/text-field/TextField';
import 'react-dates/lib/css/_datepicker.css';
import { Select } from '../../atoms/select/Select';

import './Filter.scss';

export type FilterConfiguration = {
    /**
     * The name of this filter
     */
    name: string,
    /**
     * The type of filter to be applied. Number and search map to input fields, option maps to a select box and date
     * maps to an AirBnb date range selector
     */
    type: 'number' | 'option' | 'date' | 'search',
    /**
     * The initial value with which to populate the field
     */
    initial?: number | string | Date,
    /**
     * The options to be displayed in  the options menu if relevant
     */
    options?: string[] | { key: string, value: string }[],
    /**
     * The maximum value allowed where relevant
     */
    max?: number | Date,
    /**
     * The minimum value allowed where relevant
     */
    min?: number | Date,
};

export type FilterPropsType = {
    /**
     * The set of possible filters to be displayed in this bar
     */
    filters: {
        [key: string]: FilterConfiguration,
    },
    /**
     * The optional function to be called when a filter is changed. It contains all the filters currently in use if
     * they have had a value provided
     * @param filters all filters currently in use with their current state
     */
    onFilterChange?: (filters: {
        [key: string]: DateFilterStatus | NumberFilterStatus | SelectFilterStatus | SearchFilterStatus
    }) => void,
}

export type DateFilterStatus = {
    /**
     * The start date of the filter range. If null the user has not selected a date
     */
    startDate: Moment | null,
    /**
     * The end date of the filter range. If null the user has not selected a date
     */
    endDate: Moment | null,
    /**
     * If set it holds the currently focused field of the date range selector
     */
    focusedInput?: 'startDate' | 'endDate' | null,
};

export type NumberFilterStatus = {
    /**
     * The current value in the input field if one has been specified
     */
    value?: number,
}

export type SelectFilterStatus = {
    /**
     * The currently selected option from the select input
     */
    selectedOption: string | { key: string, value: string },
};

export type SearchFilterStatus = {
    /**
     * The current value in the search field
     */
    content: string,
};

export type FilterStateType = {
    /**
     * Contains the current state of all date filters in use
     */
    dateFilterStates: {
        [key: string]: DateFilterStatus
    },
    /**
     * Contains the current state of all the number filters in use
     */
    numberFilterStates: {
        [key: string]: NumberFilterStatus
    },
    /**
     * Contains the current state of all the select filters in use
     */
    selectFilterStates: {
        [key: string]: SelectFilterStatus,
    },
    /**
     * Contains the current state of all the search filters in use
     */
    searchFilterStates: {
        [key: string]: SearchFilterStatus
    }
};

export class Filter extends React.Component<FilterPropsType, FilterStateType> {

    static displayName = 'Filter';

    constructor(props: Readonly<FilterPropsType>) {
        super(props);

        this.state = {
            dateFilterStates: {},
            numberFilterStates: {},
            selectFilterStates: {},
            searchFilterStates: {},
        };

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
    private notify() {
        if (this.props.onFilterChange) {
            this.props.onFilterChange({
                ...this.state.searchFilterStates,
                ...this.state.selectFilterStates,
                ...this.state.numberFilterStates,
                ...this.state.dateFilterStates,
            });
        }
    }

    /**
     * Updates the select input by placing it into the active state if it is the first time it is being updated or
     * just updated if it is already specified
     * @param key the key of the select filter
     * @param option the value that has been selected
     */
    private updateSelectInput(key: string, option: string | { key: string, value: string }) {
        this.setState((oldState) => {
            const s = { ...oldState };

            if (Object.prototype.hasOwnProperty.call(s.selectFilterStates, key)) {
                s.selectFilterStates[key].selectedOption = option;
            } else {
                s.selectFilterStates[key] = {
                    selectedOption: option,
                };
            }

            this.notify();

            return s;
        });
    }

    /**
     * Updates the search input by placing it into the active state if it is the first time it is being updated or
     * just updated if it is already specified
     * @param key the key of the search filter
     * @param value the value that has been entered
     */
    private updateSearchInput(key: string, value: string) {
        this.setState((oldState) => {
            const s = { ...oldState };

            if (Object.prototype.hasOwnProperty.call(s.searchFilterStates, key)) {
                s.searchFilterStates[key].content = value;
            } else {
                s.searchFilterStates[key] = {
                    content: value,
                };
            }

            this.notify();

            return s;
        });
    }

    /**
     * Produces a {@link Select} component containing the name of this filter as the placeholder, the options provided
     * and a select listener which updates the state.
     * @param key the key of this filter to be used as the select name
     * @param select the select filter configuration
     */
    private makeSelectInput(key: string, select: FilterConfiguration) {
        return (
            <div className="indv-filter">
                <Select
                    placeholder={select.name}
                    name={key}
                    options={select.options || []}
                    onSelectListener={(option) => this.updateSelectInput(key, option)}
                    initialOption={
                        Object.prototype.hasOwnProperty.call(this.state.selectFilterStates, key)
                            ? this.state.selectFilterStates[key].selectedOption
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
            const newVal = typeof (value) === 'number' ? value : parseInt(value, 10);

            this.setState((oldState) => {
                const s = { ...oldState };

                if (Object.prototype.hasOwnProperty.call(s.numberFilterStates, key)) {
                    s.numberFilterStates[key].value = newVal;
                } else {
                    s.numberFilterStates[key] = {
                        value: newVal,
                    };
                }

                this.notify();

                return s;
            });
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
            ...(Object.prototype.hasOwnProperty.call(this.state.numberFilterStates, key)
                ? this.state.numberFilterStates[key]
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
        this.setState((oldState) => {
            const s = { ...oldState };

            if (Object.prototype.hasOwnProperty.call(s.dateFilterStates, key)) {
                s.dateFilterStates[key].focusedInput = focus;
            } else {
                s.dateFilterStates[key] = {
                    startDate: null,
                    endDate: null,
                    focusedInput: focus,
                };
            }

            this.notify();

            return s;
        });
    }

    /**
     * Updates the date input by placing it into the active state if it is the first time it is being updated or
     * just updated if it is already specified
     * @param key the key of the date filter
     * @param start the select start time or null if one is not set
     * @param end the select end time or null if one is not set
     */
    private updateDateInput(key: string, start: Moment | null, end: Moment | null) {
        this.setState((oldState) => {
            const s = { ...oldState };

            if (Object.prototype.hasOwnProperty.call(s.dateFilterStates, key)) {
                s.dateFilterStates[key] = {
                    ...(s.dateFilterStates[key]),
                    startDate: start,
                    endDate: end,
                };
            } else {
                s.dateFilterStates[key] = {
                    startDate: start,
                    endDate: end,
                    focusedInput: null,
                };
            }

            return s;
        });
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

        if (Object.prototype.hasOwnProperty.call(this.state.dateFilterStates, key)) {
            spreadProperties = this.state.dateFilterStates[key];
        }

        return (
            <div className="indv-filter">
                <div className="label">{date.name}</div>
                <DateRangePicker
                    startDate={moment.unix(0)}
                    enableOutsideDays
                    isOutsideRange={() => false}
                    endDate={null}
                    onDatesChange={(change) => this.updateDateInput(key, change.startDate, change.endDate)}
                    onFocusChange={(focus) => this.updateDateFocus(key, focus)}
                    startDateId="start-date-id"
                    endDateId="end-date-id"
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
        const initialContent = Object.prototype.hasOwnProperty.call(this.state.searchFilterStates, key)
            ? this.state.searchFilterStates[key].content
            : undefined;

        return (
            <div className="indv-filter">
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
        return (
            <div
                className="filter"
            >
                {filters}
            </div>
        );
    }

}
