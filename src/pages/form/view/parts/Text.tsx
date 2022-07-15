import FormElement, { BasePart, FormEditElement } from './Part';
import * as zod from 'zod';
import React from 'react';
import { TextField } from '../../../../components/atoms/text-field/TextField';
import { StageType } from '../Form';

export const TextValidator = BasePart.extend({
	type: zod.literal('text'),
	value: zod.string().optional(),
	area: zod.boolean().optional(),
});

export type TextConfiguration = zod.infer<typeof TextValidator>;
export type TextProps = TextConfiguration & {
	onTextChange?: (value: string) => void;
};

export const TextEditPart: React.FunctionComponent<
	TextConfiguration & {
		onConfigurationChange: (change: TextConfiguration) => void;
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

// TODO: email validation
const TextPart: React.FunctionComponent<TextProps> = (props) => {
	const update = props.onTextChange ?? (() => undefined);

	return (
		<FormElement
			detail={props.detail}
			required={props.required}
			prompt={props.prompt}
		>
			<TextField
				onChange={(v: string) => update(v)}
				name={''}
				style={{ margin: '10px' }}
				initialContent={props.value}
				type={props.area ? 'textarea' : 'text'}
			/>
		</FormElement>
	);
};
export default TextPart;
