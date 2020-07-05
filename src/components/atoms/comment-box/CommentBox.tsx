import * as React from 'react';
import { Link } from 'react-router-dom';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { ContentClass, User } from '../../../types/Event';

import { TextField } from '../text-field/TextField';
import { Button } from '../button/Button';

import '../comment/Comment.scss';
import { Select } from '../select/Select';

export type CommentBoxPropsType = {
    poster: User,
    contentClasses: ContentClass[],
    submitCommentHandler: (content: string, type?: ContentClass) => void;
}

export type CommentBoxStateType = {
    error?: string
    content: string,
    type?: ContentClass,
}

export class CommentBox extends React.Component<CommentBoxPropsType, CommentBoxStateType> {

    static displayName = 'CommentBox';

    constructor(props: Readonly<CommentBoxPropsType>) {
        super(props);

        this.state = {
            content: '',
        };

        this.handleChange = this.handleChange.bind(this);
    }

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
                            <div className="username">{this.props.poster.username}</div>
                        </Link>
                    </div>
                    <div className="bottom content submit">
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
