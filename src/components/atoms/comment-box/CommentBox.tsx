import * as React from 'react';
import { Link } from 'react-router-dom';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { GatewayTopic } from '../../../types/Event';

import { TextField } from '../text-field/TextField';
import { Button } from '../button/Button';

import '../comment/Comment.scss';
import { Select } from '../select/Select';
import { GlobalContext } from "../../../context/GlobalContext";

export type CommentBoxPropsType = {
    contentClasses: GatewayTopic[],
    submitCommentHandler: (content: string, type?: GatewayTopic) => void;
}

export type CommentBoxStateType = {
    error?: string
    content: string,
    type?: GatewayTopic,
}

export class CommentBox extends React.Component<CommentBoxPropsType, CommentBoxStateType> {

    static displayName = 'CommentBox';
    static contextType = GlobalContext;

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
                        {
                            this.context.user.value
                                ? (
                                    <img
                                        alt={`Profile for ${this.context.user.value.name}`}
                                        src={this.context.user.value.profile || 'https://placehold.it/200x200'}
                                    />
                                )
                                :
                                (
                                    <img
                                        alt={`Profile for unknown user`}
                                        src={'https://placehold.it/200x200?text=Broken%3F'}
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
                                        <div className="username">@{this.context.user.value.username}</div>
                                    </Link>
                                )
                                :
                                (
                                    <div className="poster">
                                        <div className="name">Error: No User Defined</div>
                                    </div>
                                )
                        }

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

// @ts-ignore
Event.contextType = GlobalContext;
