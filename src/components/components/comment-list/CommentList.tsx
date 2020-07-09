import * as React from 'react';
import { Comment as CommentType, User } from '../../../types/Event';
import { CommentBox } from '../../atoms/comment-box/CommentBox';
import { Comment } from '../../atoms/comment/Comment';
import { GlobalContext } from "../../../context/GlobalContext";

export type CommentListPropsType = {
    comments: CommentType[],
};

export type CommentListStateType = {
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

    private handleSubmit(content: string) {
        this.setState((oldState) => ({
            comments: oldState.comments.concat({
                content,
                type: {
                    name: '?',
                },
                poster: this.context.user,
                posted: new Date(),
            }),
        }));
    }

    render() {
        return (
            <div className="comment-list">
                <CommentBox
                    contentClasses={[]}
                    submitCommentHandler={this.handleSubmit}
                />
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
CommentList.contextType = GlobalContext;

