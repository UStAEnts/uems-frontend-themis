import * as React from 'react';
import { CSSProperties } from 'react';

import './TextField.scss';
import '../text-area/TextArea.scss';
import DatePicker from 'react-flatpickr';
import {classes} from "../../../utilities/UIUtilities";
import styles from './TextField.module.scss';

export type BaseConfiguration = {
	/**
	 * The name of the text field. This will be used as the description unless a {@link TextFieldPropsType#placeholder}
	 * is provided. This will also form the 'id' property of the input field.
	 */
	name: string;
	/**
	 * If the content in this field is required. If set to true, an additional '* Required' will be added to the
	 * description but this will not affect how the parent is notified of changes
	 */
	required?: boolean;
	/**
	 * The placeholder text to replace the 'name' value to be shown beneath it when it is focused and in the field when
	 * not
	 */
	placeholder?: string;
	/**
	 * If the label should be omitted from rendering, for example when the parent is handling the labelling themselves
	 */
	noLabel?: boolean;
	/**
	 * Any additional style properties to be added to the field
	 */
    style?: CSSProperties;
    /**
     * Additional class names to add to the element
     */
    className?: string;
}

export type TextAreaConfiguration = {
	type: 'textarea';
	/**
	 * The initial content to display in the field. If this is updated, the state will be modified via
	 * {@link TextField#getDerivedStateFromProps}.
	 */
	initialContent?: string;

	onChange?: (value: string) => void;
} & BaseConfiguration;

export type TextInputConfiguration = {
	type: 'text';
	/**
	 * The initial content to display in the field. If this is updated, the state will be modified via
	 * {@link TextField#getDerivedStateFromProps}.
	 */
	initialContent?: string;

	onChange?: (value: string) => void;
} & BaseConfiguration;

export type NumberConfiguration = {
	type: 'number';
	/**
	 * For the relevant HTML input types, this is their minimum value
	 */
	min?: number | string;
	/**
	 * For the relevant HTML input types, this is their maximum value
	 */
	max?: number | string;
	/**
	 * The initial content to display in the field. If this is updated, the state will be modified via
	 * {@link TextField#getDerivedStateFromProps}.
	 */
	initialContent?: number;

	onChange?: (value: number) => void;
} & BaseConfiguration;

export type DateTimeConfiguration = {
	type: 'datetime';
	/**
	 * The initial content to display in the field. If this is updated, the state will be modified via
	 * {@link TextField#getDerivedStateFromProps}.
	 */
	initialContent?: Date;
	min?: Date;
	max?: Date;

	onChange?: (value: Date) => void;
} & BaseConfiguration;

export type TextFieldPropsType =
	| TextAreaConfiguration
	| TextInputConfiguration
	| NumberConfiguration
	| DateTimeConfiguration;

export type TextFieldStateType = {
	/**
	 * The current contents of the text field
	 */
    contents: string | Date | number;
    /**
     * If the input currently has focus
     */
    focus: boolean;
};

export class TextField extends React.Component<
	TextFieldPropsType,
	TextFieldStateType
> {
	/**
	 * Derives the contents from the given props if it is different and not undefined
	 * @param props the new props instance
	 * @param state the existing state instance
	 * @return a new state or null if the state does not need changed
	 */
	static getDerivedStateFromProps(
		props: TextFieldPropsType,
		state: TextFieldStateType
	) {
		if (
			props.initialContent !== state.contents &&
			props.initialContent !== undefined
		) {
			return {
				...state,
				contents: props.initialContent,
			} as TextFieldStateType;
		}

		return null;
	}

	static displayName = 'TextField';

	static defaultProps = {
		required: false,
		type: 'text',
		noLabel: false,
	};

	/**
	 * After setting up the props it will initialise the state with either the initial content if not undefined or an
	 * empty string if so.
	 * @param props the props as described by {@link TextFieldPropsType}
	 */
	constructor(props: Readonly<TextFieldPropsType>) {
		super(props);

        this.state = {contents: (this.props.initialContent || ''), focus: false};
	}

	/**
	 * Updates the state with the given HTML event (event.target.value) and then calls the change handler with it if one
	 * is specified.
	 * @param event the HTML key event
	 */
	private handleChange = (event: any) => {
		this.setState({
			contents: event.target.value,
		});
		if (this.props.onChange) {
			// @ts-ignore
			this.props.onChange(event.target.value);
		}
	};

	private handleBasicChange = (value: string | Date | number) => {
		this.setState({
			contents: value,
		});
		if (this.props.onChange) {
			// @ts-ignore
			this.props.onChange(value);
		}
	};

	private buildTextArea = (config: TextAreaConfiguration) => (
		<textarea
			id={config.name}
			onChange={this.handleChange}
			value={String(this.state.contents)}
			aria-label={config.placeholder ?? config.name}
		/>
	);

	private buildTextInput = (config: TextInputConfiguration) => (
		<input
			id={config.name}
			type="text"
			value={String(this.state.contents)}
			onChange={this.handleChange}
			alt={config.placeholder ?? config.name}
		/>
	);

	private buildNumberInput = (config: NumberConfiguration) => (
		<input
			id={config.name}
			type="number"
			min={config.min}
			max={config.max}
			onChange={this.handleChange}
			value={Number(this.state.contents)}
			alt={config.placeholder ?? config.name}
		/>
	);

	private buildDateTimeInput = (config: DateTimeConfiguration) => (
		// @ts-ignore
		<DatePicker
			data-enable-time
			value={this.state.contents as Date}
			options={{
				dateFormat: 'D J M Y @ H:i',
			}}
			onChange={(change) => this.handleBasicChange(change[0])}
			min={config.min}
			max={config.max}
			alt={config.placeholder ?? config.name}
		/>
	);

	render() {
        // New type until the full migration is done
        if (this.props.type === 'text') {
            return (
                <div className={classes(
                    styles.wrapper,
                    this.state.focus ? styles['wrapper--focus'] : undefined,
                    this.props.className
                )} style={this.props.style}>
                    <input type='text'
                           onFocus={() => this.setState((s) => ({...s, focus: true}))}
                           onBlur={() => this.setState((s) => ({...s, focus: false}))}
                           value={this.state.contents as string}
                           name={this.props.name}
                           required={this.props.required}
                           onChange={this.handleChange}
                    />
                    {
                        this.props.noLabel
                            ? null
                            :
                            <label>{this.props.placeholder ?? this.props.name}{this.props.required ? ' *' : ''}</label>
                    }
                </div>
            )
        }
        if (this.props.type === 'number') {
            return (
                <div className={classes(
                    styles.wrapper,
                    this.state.focus ? styles['wrapper--focus'] : undefined,
                    this.props.className
                )} style={this.props.style}>
                    <input type='number'
                           onFocus={() => this.setState((s) => ({...s, focus: true}))}
                           onBlur={() => this.setState((s) => ({...s, focus: false}))}
                           value={this.state.contents as string}
                           name={this.props.name}
                           required={this.props.required}
                           onChange={this.handleChange}
                           min={this.props.min}
                           max={this.props.max}
                    />
                    {
                        this.props.noLabel
                            ? null
                            :
                            <label>{this.props.placeholder ?? this.props.name}{this.props.required ? ' *' : ''}</label>
                    }
                </div>
            )
        }
        if (this.props.type === 'textarea') {
            return (
                <div className={classes(
                    styles.wrapper,
                    this.state.focus ? styles['wrapper--focus'] : undefined,
                    this.props.className
                )} style={this.props.style}>
                    <textarea onFocus={() => this.setState((s) => ({...s, focus: true}))}
                              onBlur={() => this.setState((s) => ({...s, focus: false}))}
                              value={this.state.contents as string}
                              name={this.props.name}
                              required={this.props.required}
                              onChange={this.handleChange}
                    ></textarea>
                    {
                        this.props.noLabel
                            ? null
                            :
                            <label>{this.props.placeholder ?? this.props.name}{this.props.required ? ' *' : ''}</label>
                    }
                </div>
            )
		}
        if (this.props.type === 'datetime') {
            const config: DateTimeConfiguration = this.props;

            // TODO: you have to click this twice??
            return (
                <div className={classes(
                    styles.wrapper,
                    this.state.focus ? styles['wrapper--focus'] : undefined,
                    this.props.className
                )} style={this.props.style}>
                    <DatePicker
                        data-enable-time
                        value={this.state.contents as Date}
                        options={{
                            dateFormat: 'D J M Y @ H:i',
                        }}
                        onChange={(change) => this.handleBasicChange(change[0])}
                        // min={config.min}
                        // max={config.max}
                        alt={config.placeholder ?? config.name}
                        //@ts-ignore
                        onFocus={() => this.setState((s) => ({...s, focus: true}))}
                        //@ts-ignore
                        onBlur={() => this.setState((s) => ({...s, focus: false}))}
                    />
                    {
                        this.props.noLabel
                            ? null
                            :
                            <label>{this.props.placeholder ?? this.props.name}{this.props.required ? ' *' : ''}</label>
                    }
                </div>
            )
        }
        // let input;
        //
        // switch (this.props.type) {
        //     case 'datetime':
        //         input = this.buildDateTimeInput(this.props);
        //         break;
        //     default:
        //         input = undefined;
        //         break;
        // }
        //
        // const sublabel = this.props.required
        //     ? <small className="required">* Required</small>
        //     : undefined;
        //
        // // Only render the label if we have opted to include the label
        // // Include required even if we've opted to not have the label. If they are that concerned
        // // they can hide it with CSS
        // const label = this.props.noLabel
        //     ? sublabel
        //     : (
        //         <label
        //             htmlFor={this.props.name}
        //             className={this.state.contents === '' || this.state.contents === undefined ? '' : 'contains'}
        //         >
        //             {this.props.placeholder || this.props.name}
        //             {' '}
        //             {sublabel}
        //         </label>
        //     );
        //
        // const cl = classes('text-field', this.props.className);
        // return (
        //     <div className={cl} style={this.props.style}>
        //         {input}
        //         <span className="highlight"/>
        //         <span className="bar"/>
        //         {label}
        //     </div>
        // );
	}
}
