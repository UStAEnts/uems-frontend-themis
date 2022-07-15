import * as zod from 'zod';
import { undefined } from 'zod';
import FormElement, { BasePart, FormEditElement } from './Part';
import React, { useRef } from 'react';
import { StageType } from '../Form';

export const CheckboxValidator = BasePart.extend({
	type: zod.literal('checkbox'),
	value: zod.boolean().optional(),
});

export type CheckboxConfiguration = zod.infer<typeof CheckboxValidator>;

export const CheckboxEditPart: React.FunctionComponent<
	CheckboxConfiguration & {
		onConfigurationChange: (change: CheckboxConfiguration) => void;
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

const CheckboxPart: React.FunctionComponent<
	CheckboxConfiguration & { onCheckChange?: (value: boolean) => void }
> = (props) => {
	const ref = useRef<HTMLInputElement>(null);
	const func = props.onCheckChange ?? (() => undefined);

	return (
		<FormElement
			detail={props.detail}
			required={props.required}
			prompt={props.prompt}
		>
			<br />
			<input
				type="checkbox"
				ref={ref}
				onChange={() => func(ref.current?.checked ?? false)}
				checked={props.value}
			/>
		</FormElement>
	);
};

export default CheckboxPart;
