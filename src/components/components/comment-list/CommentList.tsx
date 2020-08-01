import * as React from 'react';
import { CommentBox } from '../../atoms/comment-box/CommentBox';
import { Comment } from '../../atoms/comment/Comment';
import { GlobalContext } from '../../../context/GlobalContext';
import { CommentResponse, EventPropertyChangeResponse, TopicResponse } from '../../../utilities/APIGen';
import { ReactNode } from "react";
import { EventUpdate } from "../../atoms/update/EventUpdate";


export type CommentListPropsType = {
    /**
     * The list of comments which should be rendered in this list
     */
    comments: CommentResponse[],
    /**
     * The list of available topics
     */
    topics: TopicResponse[],
    /**
     * The list of updates if relevant
     */
    updates?: EventPropertyChangeResponse[],
    /**
     * Handler function for comment submission
     */
    onCommentSent?: (content: string, topic: string) => void,
    /**
     * If the list should be shown without a compose box
     */
    withoutBox?: boolean,
};

type TimeSortableElement = {
    time: number,
    component: ReactNode,
}

export class CommentList extends React.Component<CommentListPropsType, {}> {

    static displayName = 'CommentList';

    static contextType = GlobalContext;

    constructor(props: Readonly<CommentListPropsType>) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Handles the user submitting a new comment. This updates the state to inject the new comment into the list with
     * an unknown type
     * @param content the content of the comment
     * @param type the content type of this comment
     */
    private handleSubmit(content: string, type: TopicResponse) {
        if (this.props.onCommentSent) this.props.onCommentSent(content, type.id);
    }

    render() {
        const comments = this.props.comments.map((e) => ({
            time: e.posted,
            component: <Comment comment={e} key={e.id} />,
        } as TimeSortableElement));

        const updates = (this.props.updates ?? []).map((e) => ({
            time: e.occurred,
            component: <EventUpdate update={e} key={e.id} />,
        } as TimeSortableElement))

        const joined = comments.concat(updates).sort(
            (a, b) => b.time - a.time
        ).map((e) => e.component);

        const box = this.props.withoutBox
            ? undefined
            : (
                <CommentBox
                    contentClasses={this.props.topics}
                    submitCommentHandler={this.handleSubmit}
                />
            )

        return (
            <div className="comment-list">
                {box}
                {/* We decide to sort the comments in reverse chronological order (newest first). The state set of
                 comments is added to the props and then rendered to allow for easy manipulation */}
                {joined}
                {/*{this.props.comments*/}
                {/*    .sort((a, b) => b.posted - a.posted)*/}
                {/*    .map((e) => (*/}
                {/*        <Comment key={e.id} comment={e} />*/}
                {/*    ))}*/}
            </div>
        );
    }

}
