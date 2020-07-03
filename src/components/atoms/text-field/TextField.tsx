import * as React from 'react';

import './TextField.scss';
import '../text-area/TextArea.scss';

export type TextFieldPropsType = {
    name: string,
    required: boolean,
    type: string,
    placeholder?: string
    noLabel?: boolean
    onChange?: (content: string) => void,
    initialContent?: string,
    min?: number | string,
    max?: number | string,
}

export type TextFieldStateType = {
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

    constructor(props: Readonly<TextFieldPropsType>) {
        super(props);

        this.state = { contents: (this.props.initialContent || '') };
    }

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

        const label = this.props.noLabel
            ? undefined
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
