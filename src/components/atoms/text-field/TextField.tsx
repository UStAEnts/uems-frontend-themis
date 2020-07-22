import * as React from 'react';

import './TextField.scss';
import '../text-area/TextArea.scss';
import DatePicker from 'react-flatpickr';

export type BaseConfiguration = {
    /**
     * The name of the text field. This will be used as the description unless a {@link TextFieldPropsType#placeholder}
     * is provided. This will also form the 'id' property of the input field.
     */
    name: string,
    /**
     * If the content in this field is required. If set to true, an additional '* Required' will be added to the
     * description but this will not affect how the parent is notified of changes
     */
    required?: boolean,
    /**
     * The placeholder text to replace the 'name' value to be shown beneath it when it is focused and in the field when
     * not
     */
    placeholder?: string
    /**
     * If the label should be omitted from rendering, for example when the parent is handling the labelling themselves
     */
    noLabel?: boolean
}

export type TextAreaConfiguration = {
    type: 'textarea',
    /**
     * The initial content to display in the field. If this is updated, the state will be modified via
     * {@link TextField#getDerivedStateFromProps}.
     */
    initialContent?: string,

    onChange: (value: string) => void,
} & BaseConfiguration;

export type TextInputConfiguration = {
    type: 'text',
    /**
     * The initial content to display in the field. If this is updated, the state will be modified via
     * {@link TextField#getDerivedStateFromProps}.
     */
    initialContent?: string,

    onChange: (value: string) => void,
} & BaseConfiguration;

export type NumberConfiguration = {
    type: 'number',
    /**
     * For the relevant HTML input types, this is their minimum value
     */
    min?: number | string,
    /**
     * For the relevant HTML input types, this is their maximum value
     */
    max?: number | string,
    /**
     * The initial content to display in the field. If this is updated, the state will be modified via
     * {@link TextField#getDerivedStateFromProps}.
     */
    initialContent?: number,

    onChange: (value: number) => void,
} & BaseConfiguration;

export type DateTimeConfiguration = {
    type: 'datetime',
    /**
     * The initial content to display in the field. If this is updated, the state will be modified via
     * {@link TextField#getDerivedStateFromProps}.
     */
    initialContent?: Date,
    min?: Date,
    max?: Date,

    onChange: (value: Date) => void,
} & BaseConfiguration;

export type TextFieldPropsType = TextAreaConfiguration
    | TextInputConfiguration
    | NumberConfiguration
    | DateTimeConfiguration;

export type TextFieldStateType = {
    /**
     * The current contents of the text field
     */
    contents: string | Date | number,
};

export class TextField extends React.Component<TextFieldPropsType, TextFieldStateType> {

    /**
     * Derives the contents from the given props if it is different and not undefined
     * @param props the new props instance
     * @param state the existing state instance
     * @return a new state or null if the state does not need changed
     */
    static getDerivedStateFromProps(props: TextFieldPropsType, state: TextFieldStateType) {
        if (props.initialContent !== state.contents && props.initialContent !== undefined) {
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
    }

    /**
     * After setting up the props it will initialise the state with either the initial content if not undefined or an
     * empty string if so.
     * @param props the props as described by {@link TextFieldPropsType}
     */
    constructor(props: Readonly<TextFieldPropsType>) {
        super(props);

        this.state = { contents: (this.props.initialContent || '') };
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
        if (this.props.onChange) { // @ts-ignore
            this.props.onChange(event.target.value);
        }
    }

    private handleBasicChange = (value: string | Date | number) => {
        this.setState({
            contents: value,
        });
        if (this.props.onChange) { // @ts-ignore
            this.props.onChange(value);
        }
    }

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
    )

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
    )

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
    )

    render() {
        let input;

        switch (this.props.type) {
            case 'datetime':
                input = this.buildDateTimeInput(this.props);
                break;
            case 'number':
                input = this.buildNumberInput(this.props);
                break;
            case 'text':
                input = this.buildTextInput(this.props);
                break;
            case 'textarea':
                input = this.buildTextArea(this.props);
                break;
            default:
                input = undefined;
                break;
        }

        // if (this.props.type === 'textarea') {
        //     input = (
        //         <textarea
        //             id={this.props.name}
        //             onChange={this.handleChange.bind(this)}
        //             value={this.state.contents}
        //         />
        //     );
        // } else {
        //     input = (
        //         <input
        //             id={this.props.name}
        //             type={this.props.type}
        //             alt={this.props.name}
        //             value={this.state.contents}
        //             onChange={this.handleChange.bind(this)}
        //             min={this.props.min}
        //             max={this.props.max}
        //         />
        //     );
        // }

        const sublabel = this.props.required
            ? <small className="required">* Required</small>
            : undefined;

        // Only render the label if we have opted to include the label
        // Include required even if we've opted to not have the label. If they are that concerned
        // they can hide it with CSS
        const label = this.props.noLabel
            ? sublabel
            : (
                <label
                    htmlFor={this.props.name}
                    className={this.state.contents === '' || this.state.contents === undefined ? '' : 'contains'}
                >
                    {this.props.placeholder || this.props.name}
                    {' '}
                    {sublabel}
                </label>
            );

        return (
            <div className={`text-field${this.props.type === 'textarea' ? ' text-area' : ''}`}>
                {input}
                <span className="highlight" />
                <span className="bar" />
                {label}
            </div>
        );
    }

}
