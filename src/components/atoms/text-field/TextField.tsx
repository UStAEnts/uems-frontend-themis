import * as React from 'react';

import './TextField.scss';
import '../text-area/TextArea.scss';

export type TextFieldPropsType = {
    name: string,
    required: boolean,
    type: string,
}

export type TextFieldStateType = {
    contents: string,
};

export class TextField extends React.Component<TextFieldPropsType, TextFieldStateType> {

    static displayName = 'TextField';

    static defaultProps = {
        required: false,
        type: 'text',
    }

    constructor(props: Readonly<TextFieldPropsType>) {
        super(props);
        this.state = { contents: '' };
    }

    private handleChange(event: any) {
        this.setState({
            contents: event.target.value,
        });
    }

    render() {
        let input;
        if (this.props.type === 'textarea') {
            input = (
                <textarea
                    id={this.props.name}
                    onChange={this.handleChange.bind(this)}
                    defaultValue={this.state.contents}
                />
            );
        } else {
            input = (
                <input
                    id={this.props.name}
                    type={this.props.type}
                    value={this.state.contents}
                    onChange={this.handleChange.bind(this)}
                />
            );
        }

        const sublabel = this.props.required
            ? <small className="required">* Required</small>
            : undefined;

        return (
            <div className={`text-field${this.props.type === 'textarea' ? ' text-area' : ''}`}>
                {input}
                <span className="highlight" />
                <span className="bar" />
                <label htmlFor={this.props.name} className={this.state.contents === '' ? '' : 'contains'}>
                    {this.props.name}
                    {' '}
                    {sublabel}
                </label>
            </div>
        );
    }

}
