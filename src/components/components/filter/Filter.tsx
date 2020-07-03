import * as React from 'react';
import { DateRangePicker } from 'react-dates';
import moment, { Moment } from 'moment';
import { TextField } from '../../atoms/text-field/TextField';
import 'react-dates/lib/css/_datepicker.css';
import { Select } from '../../atoms/select/Select';

import './Filter.scss';

export type FilterConfiguration = {
    name: string,
    type: 'number' | 'option' | 'date' | 'search',
    initial?: number | string | Date,
    options?: string[] | { key: string, value: string }[]
    max?: number | Date,
    min?: number | Date,
};

export type FilterPropsType = {
    filters: {
        [key: string]: FilterConfiguration,
    },
    onFilterChange?: (filters: {
        [key: string]: DateFilterStatus | NumberFilterStatus | SelectFilterStatus | SearchFilterStatus
    }) => void,
}

export type DateFilterStatus = {
    startDate: Moment | null,
    endDate: Moment | null,
    focusedInput?: 'startDate' | 'endDate' | null,
};

export type NumberFilterStatus = {
    value?: number,
}

export type SelectFilterStatus = {
    selectedOption: string | { key: string, value: string },
};

export type SearchFilterStatus = {
    content: string,
};

export type FilterStateType = {
    dateFilterStates: {
        [key: string]: DateFilterStatus
    },
    numberFilterStates: {
        [key: string]: NumberFilterStatus
    },
    selectFilterStates: {
        [key: string]: SelectFilterStatus,
    },
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

    private updateNumberInput(key: string, value: string) {
        try {
            const newVal = parseInt(value, 10);

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
                    onChange={(val) => this.updateNumberInput(key, val)}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...spreadProps}
                />
            </div>
        );
    }

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
