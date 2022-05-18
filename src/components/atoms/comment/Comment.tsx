import * as React from 'react';
import {Link} from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import ReactTimeAgo from 'react-time-ago';
import ReactTooltip from 'react-tooltip';
import {v4} from 'uuid';

import './Comment.scss';
import {CommentResponse} from '../../../utilities/APIGen';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

export type CommentPropsType = {
    /**
     * The comment that this block will be representing
     */
    comment: CommentResponse,
    /**
     * Handler function for when the comment is marked as resolved
     * @param id the id of the comment marked
     */
    onCommentResolved?: (id: string) => void,
    /**
     * Handler function for when the comment is marked as requiring attention
     * @param id the id of the comment marked
     */
    onCommentMarked?: (id: string) => void,
}

/**
 * Generates a comment block containing a profile image, name, content and type with tooltip. The tooltip is uniquely
 * identified with a UUID to prevent it interfering with another tooltip on the page. User pages are linked to
 * `/user/`
 * @param props the properties containing the comment which should be used to render this block
 * @constructor
 */
export function Comment(props: CommentPropsType) {
    const [id] = React.useState(v4().toString());

    return (
        <div className={"comment " + (props.comment.requiresAttention ? 'attention' : '')}>
            <div className="left">
                <ReactTooltip
                    place="top"
                    type="dark"
                    effect="float"
                    id={`cb-${id}`}
                >
                    <strong>Category: </strong>
                    <span>{props.comment.topic ? props.comment.topic.name : 'No Topic'}</span>
                </ReactTooltip>
                <div
                    data-tip
                    data-for={`cb-${id}`}
                    className="bar"
                    style={{
                        backgroundColor: props.comment.topic?.color || '#8395a7',
                    }}
                />
                <div className="image">
                    <img
                        alt={`Profile for ${props.comment.poster.name}`}
                        src={props.comment.poster.profile || '/default-icon.png'}
                    />
                </div>
            </div>
            <div className="right">
                <div className="top">
                    <div className="poster">
                        {/*TODO: SEE https://app.asana.com/0/1199734926192621/1202299888223891/f*/}
                        {/*<Link className="poster" to={`/user/${props.comment.poster.username}`}>*/}
                        {/*</Link>*/}
                        <div className="name">{props.comment.poster.name}</div>
                        <div className="username">
                            @
                            {props.comment.poster.username}
                        </div>
                    </div>
                    <div className="spacer"/>
                    <div className="time">
                        <ReactTimeAgo locale="en" date={props.comment.posted * 1000}/>
                    </div>
                </div>
                <div className="bottom content">
                    <Markdown>{props.comment.body}</Markdown>
                </div>
            </div>
            <div className="flags">
                <ReactTooltip
                    place="top"
                    type="dark"
                    effect="float"
                    id={`cb-attention-${id}`}
                >Mark as {props.comment.requiresAttention ? 'resolved' : 'requiring attention'}</ReactTooltip>
                {
                    props.comment.requiresAttention
                        ? (<FontAwesomeIcon data-tip data-for={`cb-attention-${id}`} icon={faCheckCircle}
                                            onClick={() => props.onCommentResolved?.(props.comment.id)}/>)
                        : (<FontAwesomeIcon data-tip data-for={`cb-attention-${id}`} icon={faExclamationTriangle}
                                            onClick={() => props.onCommentMarked?.(props.comment.id)}/>)
                }
            </div>
        </div>
    );
}
