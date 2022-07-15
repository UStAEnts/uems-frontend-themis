import { Form, getQuestions } from '../Form';
import React, { useCallback } from 'react';
import { classes } from '../../../../utilities/UIUtilities';
import styles from '../FormEditor.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowCircleDown,
	faArrowCircleUp,
	faPlusCircle,
	faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import StageElement from './StageElement';

type StageSetProps = {
	set: Form['stages'][number];
	idx: number | undefined;
	update: (set: StageSetProps['set']) => void;
	selected: boolean;
	selectedStage: number;
	onClick: () => void;
	onClickStage: (index: number) => void;
	onRemove: () => void;
	onRemoveStage: (index: number) => void;
	onMove: (direction: 'up' | 'down') => void;
};

const StageSet: React.FunctionComponent<StageSetProps> = ({
	set,
	idx,
	update,
	selected,
	selectedStage,
	onClickStage,
	onClick,
	onRemove,
	onRemoveStage,
	onMove,
}) => {
	const move = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			const original = 'questions' in set ? set.questions : set;
			let copy = [...original];
			copy.splice(dragIndex, 1);
			copy.splice(hoverIndex, 0, original[dragIndex]);
			update('questions' in set ? { ...set, questions: copy } : copy);
		},
		[set, update]
	);

	return (
		<div>
			{(idx ?? 0) === 0 ? undefined : <hr />}
			<div
				className={classes(
					styles.stageSet,
					selected ? styles.selected : undefined
				)}
			>
				<div className={styles.horizontal}>
					<div className={classes(styles.left, styles.movement)}>
						<FontAwesomeIcon
							icon={faArrowCircleUp}
							onClick={() => onMove('up')}
						/>
						<FontAwesomeIcon
							icon={faArrowCircleDown}
							onClick={() => onMove('down')}
						/>
						<FontAwesomeIcon icon={faTimesCircle} onClick={() => onRemove()} />
					</div>
					<div className={styles.right}>
						<span>
							<div onClick={onClick}>
								{'title' in set ? set.title : `Stage ${(idx ?? 0) + 1}`}
							</div>
							<div>
								{(Array.isArray(set) ? set : set.questions).map((e, i) => (
									<StageElement
										key={`stageElement.${i}.${e.type}`}
										stage={e}
										move={move}
										index={i}
										selected={i === selectedStage}
										onClick={() => onClickStage(i)}
										onRemove={() => onRemoveStage(i)}
									/>
								))}
							</div>
						</span>
					</div>
				</div>
				<button className={styles.add}>
					<FontAwesomeIcon
						icon={faPlusCircle}
						onClick={() => {
							const questions = [...getQuestions(set)];
							questions.push({
								type: 'text',
								prompt: '',
							});

							update('questions' in set ? { ...set, questions } : questions);
						}}
					/>
				</button>
			</div>
		</div>
	);
};

export default StageSet;
