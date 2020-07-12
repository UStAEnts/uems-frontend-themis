import * as React from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import ReactTimeAgo from 'react-time-ago';
import ReactTooltip from 'react-tooltip';
import { v4 } from 'uuid';
import { Comment as CommentType } from '../../../types/Event';

import './Comment.scss';

export type CommentPropsType = {
    comment: CommentType,
}

export function Comment(props: CommentPropsType) {
    const [id] = React.useState(v4().toString());

    return (
        <div className="comment">
            <div className="left">
                <ReactTooltip
                    place="top"
                    type="dark"
                    effect="float"
                    id={`cb-${id}`}
                >
                    <strong>Category: </strong>
                    <span>{props.comment.topic.name}</span>
                </ReactTooltip>
                <div
                    data-tip
                    data-for={`cb-${id}`}
                    className="bar"
                    style={{
                        backgroundColor: props.comment.topic.color || '#8395a7',
                    }}
                />
                <div className="image">
                    <img
                        alt={`Profile for ${props.comment.poster.name}`}
                        src={props.comment.poster.profile || 'https://placehold.it/200x200'}
                    />
                </div>
            </div>
            <div className="right">
                <div className="top">
                    <Link className="poster" to={`/user/${props.comment.poster.username}`}>
                        <div className="name">{props.comment.poster.name}</div>
                        <div className="username">@{props.comment.poster.username}</div>
                    </Link>
                    <div className="spacer" />
                    <div className="time">
                        <ReactTimeAgo locale="en" date={props.comment.posted} />
                    </div>
                </div>
                <div className="bottom content">
                    <Markdown>{props.comment.content}</Markdown>
                </div>
            </div>
        </div>
    );
}
