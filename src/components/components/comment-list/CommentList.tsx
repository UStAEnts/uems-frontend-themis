import * as React from 'react';
import { CommentBox } from '../../atoms/comment-box/CommentBox';
import { Comment } from '../../atoms/comment/Comment';
import { GlobalContext } from '../../../context/GlobalContext';
import { CommentResponse } from '../../../utilities/APITypes';

export type CommentListPropsType = {
    /**
     * The list of comments which should be rendered in this list
     */
    comments: CommentResponse[],
};

export type CommentListStateType = {
    /**
     * The list of comments currently being rendered in addition to those provided in the props
     */
    comments: CommentResponse[],
};

export class CommentList extends React.Component<CommentListPropsType, CommentListStateType> {

    static displayName = 'CommentList';

    static contextType = GlobalContext;

    constructor(props: Readonly<CommentListPropsType>) {
        super(props);

        this.state = {
            comments: [],
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Handles the user submitting a new comment. This updates the state to inject the new comment into the list with
     * an unknown type
     * @param content the content of the comment
     */
    private handleSubmit(content: string) {
        // TODO: migrate to a proper submission
        // this.setState((oldState) => ({
        //     comments: oldState.comments.concat({
        //         id: '',
        //         content,
        //         topic: {
        //             name: '?',
        //         },
        //         poster: this.context.user,
        //         posted: new Date().getTime(),
        //     } as CommentResponse),
        // }));
        // TODO: update parent etc - general net things
    }

    render() {
        return (
            <div className="comment-list">
                <CommentBox
                    contentClasses={[]}
                    submitCommentHandler={this.handleSubmit}
                />
                {/* We decide to sort the comments in reverse chronological order (newest first). The state set of
                 comments is added to the props and then rendered to allow for easy manipulation */}
                {this.props.comments
                    .concat(this.state.comments)
                    .sort((a, b) => b.posted - a.posted)
                    .map((e) => (
                        <Comment comment={e} />
                    ))}
            </div>
        );
    }

}
