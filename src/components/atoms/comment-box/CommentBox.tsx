import * as React from 'react';
import { Link } from 'react-router-dom';
import { faComment } from '@fortawesome/free-solid-svg-icons';

import { TextField } from '../text-field/TextField';
import { Button } from '../button/Button';

import '../comment/Comment.scss';
import { KeyValueOption, Select } from '../select/Select';
import { GlobalContext } from '../../../context/GlobalContext';
import { TopicResponse } from '../../../utilities/APIGen';

export type CommentBoxPropsType = {
    /**
     * The set of content classes through which the user can tag their messages
     */
    contentClasses: TopicResponse[],
    /**
     * An external handler to be called when the user presses submit on their comment which should handle all functions
     * related to submitting
     * @param content the text content of the comment
     * @param type the optional content type that the user selected
     */
    submitCommentHandler: (content: string, type: TopicResponse) => void;
}

export type CommentBoxStateType = {
    /**
     * The error message currently being displayed, if relevant
     */
    error?: string
    /**
     * The current content contained within the text box
     */
    content: string,
    /**
     * The currently selected text class if relevant
     */
    type?: TopicResponse,
}

/**
 * Represents a comment compose box including selection types for content classes and displaying a preview of the user
 * sending the comment
 */
export class CommentBox extends React.Component<CommentBoxPropsType, CommentBoxStateType> {

    static displayName = 'CommentBox';

    static contextType = GlobalContext;

    /**
     * Registers props and initialises the state with an empty context
     * @param props the props for this component as described by {@link CommentBoxPropsType}
     */
    constructor(props: Readonly<CommentBoxPropsType>) {
        super(props);

        this.state = {
            content: '',
        };

        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Calls the submit handler passed in the props with the content and type if relevant and will update the current
     * state to clear the text box. If the calling function raises an error, the message will be displayed to the user
     * without clearing the text field
     */
    private handleSubmit = () => {
        if (this.state.content === '' || this.state.type === undefined) {
            this.setState((oldState) => ({
                ...oldState,
                error: 'Cannot submit an empty comment or a comment without a type!',
            }));
            return;
        }
        try {
            this.props.submitCommentHandler(this.state.content, this.state.type);

            this.setState({
                error: undefined,
                content: '',
            });

        } catch (err) {
            this.setState((oldState) => ({
                ...oldState,
                error: `Error: ${err}`,
            }));
        }
    }

    /**
     * Handles the changing of the select by finding the content class with the given ID (value if an object). This
     * updates the value in the state.
     * @param option the option selected by the user
     */
    private handleSelect = (option: string | KeyValueOption) => {
        this.setState((oldState) => ({
            ...oldState,
            type: this.props.contentClasses.find(
                (e) => (typeof (option) === 'string' ? e.id === option : e.id === option.value),
            ),
        }));
    }

    /**
     * Updates the state with the given value for {@link CommentBoxStateType#content} which will trigger a render
     * @param value the new content of the text field
     */
    private handleChange(value: string) {
        this.setState((oldState) => ({
            ...oldState,
            content: value,
        }));
    }

    render() {
        return (
            <div className="comment">
                <div className="left">
                    <div className="image">
                        {
                            this.context.user.value
                                ? (
                                    <img
                                        alt={`Profile for ${this.context.user.value.name}`}
                                        src={this.context.user.value.profile || 'https://placehold.it/200x200'}
                                    />
                                )
                                : (
                                    <img
                                        alt="Profile for unknown user"
                                        src="https://placehold.it/200x200?text=Broken%3F"
                                    />
                                )
                        }

                    </div>
                </div>
                <div className="right">
                    <div className="top">
                        {
                            this.context.user.value
                                ? (
                                    <Link className="poster" to={`/user/${this.context.user.value.username}`}>
                                        <div className="name">{this.context.user.value.name}</div>
                                        <div className="username">
                                            @
                                            {this.context.user.value.username}
                                        </div>
                                    </Link>
                                )
                                : (
                                    <div className="poster">
                                        <div className="name">Error: No User Defined</div>
                                    </div>
                                )
                        }

                    </div>
                    <div className="bottom content submit">
                        {/* If an error message is defined, render an error box. Otherwise, just render undefined so it
                        will be safely ignored */}
                        {
                            this.state.error
                                ? (
                                    <p className="error">
                                        <b>Error:</b>
                                        {this.state.error}
                                    </p>
                                )
                                : undefined
                        }
                        <TextField
                            noLabel
                            initialContent={this.state.content}
                            onChange={this.handleChange}
                            name="content"
                            type="textarea"
                            required
                        />
                        <Select
                            placeholder="Type"
                            name="type"
                            options={this.props.contentClasses.map((e) => ({
                                text: e.name + (e.description ? ` (${e.description})` : ''),
                                value: e.id,
                            }))}
                            initialOption={this.state.type ? {
                                text: this.state.type.name
                                    + (this.state.type.description ? ` (${this.state.type.description})` : ''),
                                value: this.state.type.id,
                            } : undefined}
                            onSelectListener={this.handleSelect}
                        />
                        <div
                            style={{
                                marginTop: '20px',
                            }}
                        >
                            <Button
                                color="#0abde3"
                                text="Post"
                                icon={faComment}
                                onClick={this.handleSubmit}
                                name="submit"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

// @ts-ignore
Event.contextType = GlobalContext;
