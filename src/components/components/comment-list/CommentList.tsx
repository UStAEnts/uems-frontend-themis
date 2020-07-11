import * as React from 'react';
import { Comment as CommentType, User } from '../../../types/Event';
import { CommentBox } from '../../atoms/comment-box/CommentBox';
import { Comment } from '../../atoms/comment/Comment';

export type CommentListPropsType = {
    /**
     * The list of comments which should be rendered in this list
     */
    comments: CommentType[],
    /**
     * The current user to pass to the comment compose box to give an accurate preview
     */
    poster: User
};

export type CommentListStateType = {
    /**
     * The list of comments currently being rendered in addition to those provided in the props
     */
    comments: CommentType[],
};

export class CommentList extends React.Component<CommentListPropsType, CommentListStateType> {

    static displayName = 'CommentList';

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
        this.setState((oldState) => ({
            comments: oldState.comments.concat({
                content,
                type: {
                    name: '?',
                },
                poster: this.props.poster,
                posted: new Date(),
            }),
        }));
    }

    render() {
        return (
            <div className="comment-list">
                <CommentBox
                    contentClasses={[]}
                    poster={this.props.poster}
                    submitCommentHandler={this.handleSubmit}
                />
                {/* We decide to sort the comments in reverse chronological order (newest first). The state set of
                 comments is added to the props and then rendered to allow for easy manipulation */}
                {this.props.comments
                    .concat(this.state.comments)
                    .sort((a, b) => b.posted.getTime() - a.posted.getTime())
                    .map((e) => (
                        <Comment comment={e} />
                    ))}
            </div>
        );
    }

}
