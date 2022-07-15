import { Form, getQuestions } from '../Form';
import React, { useState } from 'react';
import { KeyValueOption } from '../../../../components/atoms/select/Select';
import { TextField } from '../../../../components/atoms/text-field/TextField';
import { Button } from '../../../../components/atoms/button/Button';
import { Theme } from '../../../../theme/Theme';
import FlowConditionEditor from './FlowConditionEditor';

export type StagePropertyEditorProps = {
	form: Form;
	index: number;
	onChange: (stage: Form) => void;
};

const StagePropertyEditor: React.FunctionComponent<StagePropertyEditorProps> = (
	props
) => {
	const { form, index, onChange } = props;
	const stage = form.stages[index];

	const [showAddNew, setShowAddNew] = useState(false);

	const deriveTitle = (t: Form['stages'][number]) => {
		if (!('title' in t)) return undefined;
		if (t.title.trim() === '') return undefined;
		return t.title;
	};

	const questionOptions: KeyValueOption[] = form.stages
		.map((e, si) =>
			getQuestions(e).map((entry, ei) => ({ stage: si, index: ei, entry }))
		)
		.flat()
		.filter((e) => e.entry.type !== 'title')
		.map((question) => {
			if (question.entry.type === 'title') return;
			return {
				text: `(${
					question.entry.id ?? `${question.stage + 1}.${question.index}`
				}) ${question.entry.prompt}`,
				value: question.entry.id ?? `${question.stage}.${question.index}`,
				additional: question,
			};
		})
		.filter((e) => e !== undefined) as KeyValueOption[];

	console.log(form.flow);

	return (
		<div style={{ padding: '20px' }}>
			<h2>Edit Stage</h2>
			<TextField
				type={'text'}
				onChange={(v) => {
					const copy = [...form.stages];
					const original = form.stages[index];

					if (v.trim().length === 0) {
						copy[index] = getQuestions(original);
					} else {
						if ('title' in original) {
							copy[index] = {
								...original,
								title: v,
							};
						} else {
							copy[index] = {
								title: v,
								questions: original,
							};
						}
					}

					onChange({
						...form,
						stages: copy,
					});
				}}
				name={'Title'}
				initialContent={deriveTitle(stage)}
			/>
			<div>
				<input type="checkbox" checked={form.flow.some((e) => e === index)} />
				<label>Show by default</label>
			</div>
			<div>
				{/*<FlowConditionEditor onSave={console.log} questions={questionOptions} stage={index}/>*/}
				{form.flow.map((e, idx) => {
					if (!(typeof e === 'object' && e.stages === index)) return undefined;
					console.log(e);
					return e.condition.map((f, innerIndex) => (
						<FlowConditionEditor
							key={`flow.${idx}.${innerIndex}`}
							onSave={(condition) => {
								const flows = [...form.flow];
								const entry = flows[idx];
								if (typeof entry === 'number') return;

								const conditions = [...entry.condition];
								conditions[innerIndex] = condition;

								const rebuiltFlow = {
									...entry,
									condition: conditions.filter((e) => e !== undefined),
								};
								flows.splice(idx, 1, rebuiltFlow);
								onChange({
									...form,
									flow: flows,
								});
								setShowAddNew(false);
							}}
							questions={questionOptions}
							stage={index}
							flow={f as any}
						/>
					));
				})}
				{showAddNew ? (
					<FlowConditionEditor
						onSave={(flow) => {
							const flows = [...form.flow];

							// Clean up unconditional state
							const numericalIndex = flows.findIndex(
								(e) => typeof e === 'number' && e === index
							);
							if (numericalIndex !== -1) flows.splice(numericalIndex);

							// Then find the existing entry if it exists
							const entryIndex = flows.findIndex(
								(e) => typeof e !== 'number' && e.stages === index
							);
							if (entryIndex === -1) {
								console.log('adding new', entryIndex, index);
								// Add it as a new flow
								flows.push({
									condition: [flow],
									stages: index,
								});
								onChange({
									...form,
									flow: flows,
								});
								setShowAddNew(false);
								return;
							}

							const entry = flows[entryIndex];
							if (typeof entry === 'number') return;

							const conditions = [...entry.condition];
							conditions.push(flow);

							const rebuiltFlow = {
								...entry,
								condition: conditions.filter((e) => e !== undefined),
							};
							flows.splice(entryIndex, 1, rebuiltFlow);
							onChange({
								...form,
								flow: flows,
							});
							setShowAddNew(false);
						}}
						questions={questionOptions}
						stage={index}
					/>
				) : undefined}
				{showAddNew ? undefined : (
					<Button
						color={Theme.PURPLE}
						text={'Add new'}
						onClick={() => setShowAddNew(true)}
					/>
				)}
			</div>
		</div>
	);
};

export default StagePropertyEditor;
