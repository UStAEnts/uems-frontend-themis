import React from 'react';
import * as zod from 'zod';
import { Handle, Position } from 'react-flow-renderer';
import { classes } from '../../../utilities/UIUtilities';
import styles from '../AutomationEditor.module.scss';
import { Theme } from '../../../theme/Theme';
import {
	FontAwesomeIcon,
	FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type GlobalState = Record<string, any>;
export type GlobalPassableState = {
	update: (key: string, state: any) => void;
} & GlobalState;
export type NodeComponent<T extends GlobalPassableState> =
	React.FunctionComponent<T>;
export type NodeConfiguration<T extends GlobalPassableState> = {
	inputs: Record<string, { display?: string; schema: zod.ZodSchema<any> }>;
	outputs: Record<string, { display?: string; schema: zod.ZodSchema<any> }>;
	id: string;
	title: string;
	Component: NodeComponent<
		T & { self: NodeConfiguration<T>; onRemove: () => void; id: string }
	>;
	description?: string;
	icon?: IconProp;
};

export const DefaultNode: React.FunctionComponent<{
	title: string;
	inputs: { id: string; display?: string; color?: string }[];
	outputs: { id: string; display?: string; color?: string }[];
	onRemove: () => void;
}> = ({ title, inputs, outputs, children, onRemove }) => {
	return (
		<>
			<button
				style={{
					background: 'none',
					border: 'none',
					position: 'absolute',
					top: '-6px',
					left: '-11px',
				}}
				onClick={onRemove}
			>
				<FontAwesomeIcon
					icon={faTimesCircle}
					color={Theme.GRAY_DARK}
					style={{}}
				/>
			</button>
			{inputs.map((input, i) => (
				<Handle
					key={`${i}.${input.id}`}
					type="target"
					position={Position.Left}
					id={input.id}
					className={classes(styles.handle, styles.left)}
					style={{
						background: input.color ?? Theme.RED_LIGHT,
						top: 20 + 20 * i + 'px',
					}}
				>
					{input.display ? <span>{input.display}</span> : null}
				</Handle>
			))}
			<div className={styles.node}>
				<div className={styles.title}>{title}</div>
				<div className={styles.body}>{children}</div>
			</div>
			{outputs.map((input, i) => (
				<Handle
					key={`${i}.${input.id}`}
					type="source"
					position={Position.Right}
					id={input.id}
					className={classes(styles.handle, styles.right)}
					style={{
						background: input.color ?? Theme.BLUE_LIGHT,
						top: 20 + 20 * i + 'px',
					}}
				>
					{input.display ? <span>{input.display}</span> : null}
				</Handle>
			))}
		</>
	);
};

export const DefaultConfigNode: React.FunctionComponent<
	Pick<NodeConfiguration<any>, 'title' | 'inputs' | 'outputs'> & {
		onRemove: () => void;
	}
> = (props) => {
	return (
		<DefaultNode
			onRemove={props.onRemove}
			title={props.title}
			inputs={Object.entries(props.inputs).map(([key, value]) => ({
				id: key,
				display: value.display,
			}))}
			outputs={Object.entries(props.outputs).map(([key, value]) => ({
				id: key,
				display: value.display,
			}))}
		>
			{props.children}
		</DefaultNode>
	);
};

export type GPSConfig = NodeConfiguration<GlobalPassableState>;
