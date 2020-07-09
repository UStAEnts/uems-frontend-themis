import * as React from 'react';
import { Link } from 'react-router-dom';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { ContentClass, User } from '../../../types/Event';

import { TextField } from '../text-field/TextField';
import { Button } from '../button/Button';

import '../comment/Comment.scss';
import { Select } from '../select/Select';

export type CommentBoxPropsType = {
    /**
     * The user which will be making the comment, this will show the preview of their profile image and their username
     * in the compose box
     */
    poster: User,
    /**
     * The set of content classes through which the user can tag their messages
     */
    contentClasses: ContentClass[],
    /**
     * An external handler to be called when the user presses submit on their comment which should handle all functions
     * related to submitting
     * @param content the text content of the comment
     * @param type the optional content type that the user selected
     */
    submitCommentHandler: (content: string, type?: ContentClass) => void;
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
    type?: ContentClass,
}

/**
 * Represents a comment compose box including selection types for content classes and displaying a preview of the user
 * sending the comment
 */
export class CommentBox extends React.Component<CommentBoxPropsType, CommentBoxStateType> {

    static displayName = 'CommentBox';

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
    private handleSubmit() {
        try {
            this.props.submitCommentHandler(this.state.content);

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
                        <img
                            alt={`Profile for ${this.props.poster.name}`}
                            src={this.props.poster.profile || 'https://placehold.it/200x200'}
                        />
                    </div>
                </div>
                <div className="right">
                    <div className="top">
                        <Link className="poster" to={`/user/${this.props.poster.username}`}>
                            <div className="name">{this.props.poster.name}</div>
                            <div className="username">@{this.props.poster.username}</div>
                        </Link>
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
                                key: e.name + (e.description ? ` (${e.description})` : ''),
                                value: e.name,
                            }))}
                        />
                        <div
                            style={{
                                marginTop: '20px'
                            }}
                        >
                            <Button
                                color="#0abde3"
                                text="Post"
                                icon={faComment}
                                onClick={this.handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
