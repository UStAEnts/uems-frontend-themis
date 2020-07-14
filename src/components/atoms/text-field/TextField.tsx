import * as React from 'react';

import './TextField.scss';
import '../text-area/TextArea.scss';

export type TextFieldPropsType = {
    /**
     * The name of the text field. This will be used as the description unless a {@link TextFieldPropsType#placeholder}
     * is provided. This will also form the 'id' property of the input field.
     */
    name: string,
    /**
     * If the content in this field is required. If set to true, an additional '* Required' will be added to the
     * description but this will not affect how the parent is notified of changes
     */
    required: boolean,
    /**
     * The type of the text field, either 'textarea' or any other value to indicate a text input. This type will be
     * copied into the inputs 'type' field if it is not 'textarea'
     */
    type: string,
    /**
     * The placeholder text to replace the 'name' value to be shown beneath it when it is focused and in the field when
     * not
     */
    placeholder?: string
    /**
     * If the label should be omitted from rendering, for example when the parent is handling the labelling themselves
     */
    noLabel?: boolean
    /**
     * An optional listener to be called when the content is updated by the user. This should be used to access values
     * and to manage the state of this field.
     * @param content the content of the text field after the modification is made
     */
    onChange?: (content: string) => void,
    /**
     * The initial content to display in the field. If this is updated, the state will be modified via
     * {@link TextField#getDerivedStateFromProps}.
     */
    initialContent?: string,
    /**
     * For the relevant HTML input types, this is their minimum value
     */
    min?: number | string,
    /**
     * For the relevant HTML input types, this is their maximum value
     */
    max?: number | string,
}

export type TextFieldStateType = {
    /**
     * The current contents of the text field
     */
    contents: string,
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
    private handleChange(event: any) {
        this.setState({
            contents: event.target.value,
        });
        if (this.props.onChange) this.props.onChange(event.target.value);
    }

    render() {
        let input;
        if (this.props.type === 'textarea') {
            input = (
                <textarea
                    id={this.props.name}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.contents}
                />
            );
        } else {
            input = (
                <input
                    id={this.props.name}
                    type={this.props.type}
                    value={this.state.contents}
                    onChange={this.handleChange.bind(this)}
                    min={this.props.min}
                    max={this.props.max}
                />
            );
        }

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
                    className={this.state.contents === '' ? '' : 'contains'}
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
