import * as React from 'react';
import { ReactNode } from 'react';
import { CommentBox } from '../../atoms/comment-box/CommentBox';
import { Comment } from '../../atoms/comment/Comment';
import { GlobalContext } from '../../../context/GlobalContext';
import { EventUpdate } from '../../atoms/update/EventUpdate';
import {
	CommentList as UEMSCommentList,
	Topic,
} from '../../../utilities/APIPackageGen';

export type CommentListPropsType = {
	/**
	 * The list of comments which should be rendered in this list
	 */
	comments: UEMSCommentList;
	/**
	 * The list of available topics
	 */
	topics: Topic[];
	/**
	 * The list of updates if relevant
	 * TODO: this was a thing once
	 */
	updates?: /*EventPropertyChangeResponse*/ never[];
	/**
	 * Handler function for comment submission
	 */
	onCommentSent?: (content: string, topic: string) => void;
	/**
	 * If the list should be shown without a compose box
	 */
	withoutBox?: boolean;
	/**
	 * Handler function for when the comment is marked as resolved
	 * @param id the id of the comment marked
	 */
	onCommentResolved?: (id: string) => void;
	/**
	 * Handler function for when the comment is marked as requiring attention
	 * @param id the id of the comment marked
	 */
	onCommentMarked?: (id: string) => void;
};

type TimeSortableElement = {
	time: number;
	component: ReactNode;
};

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
	private handleSubmit(content: string, type: Topic) {
		if (this.props.onCommentSent) this.props.onCommentSent(content, type.id);
	}

	render() {
		const comments = this.props.comments.map(
			(e) =>
				({
					time: e.posted,
					component: (
						<Comment
							comment={e}
							key={e.id}
							onCommentMarked={this.props.onCommentMarked}
							onCommentResolved={this.props.onCommentResolved}
						/>
					),
				} as TimeSortableElement)
		);

		// const updates = (this.props.updates ?? []).map((e) => ({
		//     time: e.occurred,
		//     component: <EventUpdate update={e} key={e.id} />,
		// } as TimeSortableElement));

		// TODO: there were updates here once
		const joined = comments /*.concat(updates)*/
			.sort((a, b) => b.time - a.time)
			.map((e) => e.component);

		const box = this.props.withoutBox ? undefined : (
			<CommentBox
				contentClasses={this.props.topics}
				submitCommentHandler={this.handleSubmit}
			/>
		);

		return (
			<div className="comment-list">
				{box}
				{/* We decide to sort the comments in reverse chronological order (newest first). The state set of
                 comments is added to the props and then rendered to allow for easy manipulation */}
				{joined}
				{/* {this.props.comments */}
				{/*    .sort((a, b) => b.posted - a.posted) */}
				{/*    .map((e) => ( */}
				{/*        <Comment key={e.id} comment={e} /> */}
				{/*    ))} */}
			</div>
		);
	}
}
