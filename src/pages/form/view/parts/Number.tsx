import FormElement, { BasePart, FormEditElement } from './Part';
import * as zod from 'zod';
import React from 'react';
import { TextField } from '../../../../components/atoms/text-field/TextField';
import { StageType } from '../Form';

export const NumberValidator = BasePart.extend({
	type: zod.literal('number'),
	value: zod.number().optional(),
});

export type NumberConfiguration = zod.infer<typeof NumberValidator>;
export type NumberProps = NumberConfiguration & {
	onNumberChange?: (value: number) => void;
};

export const NumberEditPart: React.FunctionComponent<
	NumberConfiguration & {
		onConfigurationChange: (change: NumberConfiguration) => void;
		onTypeChange: (type: StageType['type']) => void;
		onDelete: () => void;
		onMove: (direction: 'up' | 'down') => void;
	}
> = (props) => {
	return (
		<FormEditElement
			onPromptChange={(v) =>
				props.onConfigurationChange({ ...props, prompt: v })
			}
			onDetailChange={(v) =>
				props.onConfigurationChange({ ...props, detail: v })
			}
			onRequiredChange={(v) =>
				props.onConfigurationChange({ ...props, required: v })
			}
			{...props}
		>
			Nothing to configure!
		</FormEditElement>
	);
};

const NumberPart: React.FunctionComponent<NumberProps> = (props) => {
	const update = props.onNumberChange ?? (() => undefined);

	return (
		<FormElement
			detail={props.detail}
			required={props.required}
			prompt={props.prompt}
		>
			<TextField
				onChange={(v: number) => update(v)}
				name={''}
				initialContent={props.value}
				style={{ margin: '10px' }}
				type={'number'}
			/>
		</FormElement>
	);
};
export default NumberPart;
