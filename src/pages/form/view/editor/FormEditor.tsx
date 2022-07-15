import React, { useState } from 'react';
import { Form, getQuestions, StageType, TitleType } from '../Form';
import { Button } from '../../../../components/atoms/button/Button';
import { Theme } from '../../../../theme/Theme';
import styles from '../FormEditor.module.scss';
import { BasePartType } from '../parts/Part';
import { NumberConfiguration } from '../parts/Number';
import { SelectConfiguration } from '../parts/Select';
import { CheckboxConfiguration } from '../parts/Checkbox';
import { DateConfiguration } from '../parts/Date';
import { DateRangeConfiguration } from '../parts/DateRange';
import StagePropertyEditor from './StagePropertyEditor';
import StageSet from './StageSet';
import FormStageEditor from './FormStageEditor';

export const makeBlankConfig = (
	type: StageType['type'],
	existing?: BasePartType
): StageType => {
	switch (type) {
		case 'number':
			return {
				type: 'number',
				value: 0,
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
			} as NumberConfiguration;
		case 'select':
			return {
				type: 'select',
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
				options: [],
			} as SelectConfiguration;
		case 'text':
			return {
				type: 'text',
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
				value: '',
			};
		case 'title':
			return {
				type: 'title',
				text: existing?.prompt,
			} as TitleType;
		case 'checkbox':
			return {
				type: 'checkbox',
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
			} as CheckboxConfiguration;
		case 'date':
			return {
				type: 'date',
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
			} as DateConfiguration;
		case 'date-range':
			return {
				type: 'date-range',
				prompt: existing?.prompt ?? '',
				required: existing?.required ?? false,
				detail: existing?.detail ?? '',
				id: existing?.id,
			} as DateRangeConfiguration;
	}
};

const FormEditor: React.FunctionComponent<
	Form & { update: undefined | ((form: Form) => void); done: () => void }
> = (props) => {
	const [selectedState, setSelectedState] = useState(-1);
	const [selectedEntry, setSelectedEntry] = useState(-1);

	const rebuildAndUpdate = (steps: StageType[], selectedStage?: number) => {
		if (!props.update) return;

		const originalStage = props.stages[selectedStage ?? selectedState];
		const stage =
			'title' in originalStage
				? { title: originalStage.title, questions: steps }
				: steps;

		const stages = [...props.stages];
		stages[selectedStage ?? selectedState] = stage;

		const { update: _, ...form } = props;
		const converted = {
			...form,
			stages,
		};

		props.update(converted);
	};

	let right = null;
	if (selectedEntry !== -1 && selectedState !== -1) {
		right = (
			<div style={{ padding: '20px' }}>
				<FormStageEditor
					key={`s${selectedState}e${selectedEntry}`}
					element={getQuestions(props.stages[selectedState])[selectedEntry]}
					remove={() => {
						const questions = [...getQuestions(props.stages[selectedState])];
						questions.splice(selectedEntry, 1);
						rebuildAndUpdate(questions);
						setSelectedEntry(-1);
						setSelectedState(-1);
					}}
					move={(move) => {
						if (!props.update) return;

						const questions = [...getQuestions(props.stages[selectedState])];
						let nextIndex = selectedEntry + (move === 'up' ? -1 : 1);
						if (nextIndex < 0 || nextIndex >= questions.length) return;

						const temp = questions[selectedEntry];
						questions[selectedEntry] = questions[nextIndex];
						questions[nextIndex] = temp;

						rebuildAndUpdate(questions);
						setSelectedEntry(nextIndex);
					}}
					update={(update) => {
						if (!props.update) return;

						const questions = [...getQuestions(props.stages[selectedState])];
						questions[selectedEntry] = update;

						rebuildAndUpdate(questions);
					}}
				/>
			</div>
		);
	} else if (selectedState !== -1) {
		right = (
			<StagePropertyEditor
				key={`stage.${selectedState}`}
				form={props}
				index={selectedState}
				onChange={(f) => props.update?.(f)}
			/>
		);
	}
	return (
		<>
			<Button
				color={Theme.PURPLE}
				text={'Done'}
				style={{ float: 'right' }}
				onClick={props.done}
			/>
			<div className={styles.horizontal}>
				<div className={styles.left}>
					{props.stages.map((e, i) => (
						<StageSet
							key={`stage.${i}`}
							onRemoveStage={(idx) => {
								const questions = [...getQuestions(e)];
								questions.splice(idx, 1);
								rebuildAndUpdate(questions, i);
								setSelectedEntry(-1);
								setSelectedState(-1);
							}}
							onRemove={() => {
								if (!props.update) return;

								const stages = [...props.stages];
								stages.splice(i, 1);

								const { update: _, ...form } = props;
								const converted = {
									...form,
									stages,
								};

								setSelectedState(-1);
								setSelectedEntry(-1);
								props.update(converted);
							}}
							onClick={() => {
								setSelectedState(i);
								setSelectedEntry(-1);
							}}
							onClickStage={(n) => {
								setSelectedState(i);
								setSelectedEntry(n);
							}}
							selected={selectedState === i && selectedEntry === -1}
							selectedStage={
								selectedState === i && selectedEntry !== -1 ? selectedEntry : -1
							}
							set={e}
							idx={i}
							update={(s) => {
								const copy = [...props.stages];
								copy[i] = s;
								props.update?.({ flow: props.flow, stages: copy });
							}}
							onMove={(d) => {
								if (!props.update) return;

								const stages = [...props.stages];
								const nextIndex = i + (d === 'up' ? -1 : 1);
								if (nextIndex < 0 || nextIndex >= stages.length) return;

								const temp = stages[i];
								stages[i] = stages[nextIndex];
								stages[nextIndex] = temp;

								const { update: _, ...form } = props;
								const converted = {
									...form,
									stages,
								};

								props.update(converted);
							}}
						/>
					))}

					<Button
						color={Theme.BLUE}
						text={'Add Stage'}
						fullWidth
						onClick={() => {
							const { update: _, ...form } = props;
							props.update?.({
								...form,
								stages: [...form.stages, []],
							});
						}}
					/>
				</div>
				<div className={styles.right}>{right}</div>
			</div>
		</>
	);
};

export default FormEditor;
