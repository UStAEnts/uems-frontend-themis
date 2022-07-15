import { StageType } from '../Form';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCalendar,
	faCalendarAlt,
	faCheckSquare,
	faHashtag,
	faHeading,
	faList,
	faPencilAlt,
	faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { classes } from '../../../../utilities/UIUtilities';
import styles from '../FormEditor.module.scss';

type StageElementProps = {
	stage: StageType;
	move: (drag: number, hover: number) => void;
	index: number;
	onClick: () => void;
	selected: boolean;
	onRemove: () => void;
};
const StageElement: React.FunctionComponent<StageElementProps> = ({
	stage,
	// move,
	// index,
	onClick,
	selected,
	onRemove,
}) => {
	let icon: React.ReactNode | undefined = undefined;
	let title: React.ReactNode | undefined = undefined;
	let additional: React.ReactNode | undefined = undefined;

	// const ref = useRef<HTMLDivElement>(null)
	// const [{handlerId}, drop] = useDrop<StageElementProps,
	//     void,
	//     { handlerId: string | symbol | null }>({
	//     accept: 'a',
	//     collect(monitor) {
	//         return {
	//             handlerId: monitor.getHandlerId(),
	//         }
	//     },
	//     hover(item: StageElementProps, monitor) {
	//         if (!ref.current) {
	//             return
	//         }
	//         const dragIndex = item.index
	//         const hoverIndex = index
	//
	//         // Don't replace items with themselves
	//         if (dragIndex === hoverIndex) {
	//             return
	//         }
	//
	//         // Determine rectangle on screen
	//         const hoverBoundingRect = ref.current?.getBoundingClientRect()
	//
	//         // Get vertical middle
	//         const hoverMiddleY =
	//             (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
	//
	//         // Determine mouse position
	//         const clientOffset = monitor.getClientOffset()
	//
	//         // Get pixels to the top
	//         const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
	//
	//         // Only perform the move when the mouse has crossed half of the items height
	//         // When dragging downwards, only move when the cursor is below 50%
	//         // When dragging upwards, only move when the cursor is above 50%
	//
	//         // Dragging downwards
	//         if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
	//             return
	//         }
	//
	//         // Dragging upwards
	//         if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
	//             return
	//         }
	//
	//         // Time to actually perform the action
	//         move(dragIndex, hoverIndex)
	//
	//         // Note: we're mutating the monitor item here!
	//         // Generally it's better to avoid mutations,
	//         // but it's good here for the sake of performance
	//         // to avoid expensive index searches.
	//         item.index = hoverIndex
	//     },
	// })
	//
	// const [{isDragging}, drag] = useDrag({
	//     type: 'a',
	//     item: () => {
	//         return {index}
	//     },
	//     collect: (monitor: any) => ({
	//         isDragging: monitor.isDragging(),
	//     }),
	// })
	//
	// const opacity = isDragging ? 0 : 1

	switch (stage.type) {
		case 'checkbox':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faCheckSquare} />;
			break;
		case 'date':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faCalendar} />;
			break;
		case 'date-range':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faCalendarAlt} />;
			break;
		case 'number':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faHashtag} />;
			break;
		case 'select':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faList} />;
			if ('reference' in stage) {
				additional = <span>Reference to {stage.reference}</span>;
			} else {
				additional = <span>{stage.options.length} options</span>;
			}
			break;
		case 'text':
			title = stage.prompt;
			icon = <FontAwesomeIcon icon={faPencilAlt} />;
			break;
		case 'title':
			title = stage.text;
			icon = <FontAwesomeIcon icon={faHeading} />;
			break;
	}

	// drag(drop(ref))
	return (
		<div
			className={classes(
				styles.stageEntry,
				styles.horizontal,
				selected ? styles.selected : undefined
			)}
			onClick={(e) => {
				// @ts-ignore
				if ('tagName' in e.target && e.target.tagName !== 'svg') {
					onClick();
				}
			}}
			// ref={ref} style={{opacity}}             data-handler-id={handlerId}
		>
			<div className={classes(styles.left, styles.centered)}>{icon}</div>
			<div className={styles.right}>
				<div>{title}</div>
				<div className={styles.additional}>{additional}</div>
				{'id' in stage ? (
					<div className={classes(styles.additional, styles.id)}>
						#{stage.id}
					</div>
				) : undefined}
			</div>
			<div className={styles.remove}>
				<FontAwesomeIcon icon={faTimesCircle} onClick={onRemove} />
			</div>
		</div>
	);
};

export default StageElement;
