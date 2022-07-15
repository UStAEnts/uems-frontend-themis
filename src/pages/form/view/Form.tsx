import * as zod from 'zod';
import SelectPart, {
	SelectEditPart,
	SelectOptionConfiguration,
	SelectValidator,
} from './parts/Select';
import TextPart, {
	TextConfiguration,
	TextEditPart,
	TextValidator,
} from './parts/Text';
import CheckboxPart, {
	CheckboxConfiguration,
	CheckboxEditPart,
	CheckboxValidator,
} from './parts/Checkbox';
import NumberPart, {
	NumberConfiguration,
	NumberEditPart,
	NumberValidator,
} from './parts/Number';
import DatePart, {
	DateConfiguration,
	DateEditPart,
	DateValidator,
} from './parts/Date';
import DateRangePart, {
	DateRangeConfiguration,
	DateRangeEditPart,
	DateRangeValidator,
} from './parts/DateRange';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './parts/parts.module.scss';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '../../../context/GlobalContext';
import FormEditor from './editor/FormEditor';

const Comparison = zod.object({
	type: zod.enum(['gt', 'lt', 'lte', 'gte', 'ne', 'eq']),
	target: zod.string(), //.regex(),
	value: zod.any(),
});
export type ComparisonType = zod.infer<typeof Comparison>;

const Title = zod.object({
	type: zod.literal('title'),
	text: zod.string(),
});
export type TitleType = zod.infer<typeof Title>;

const FlowStage = zod.number().or(
	zod.object({
		condition: zod.array(Comparison),
		stages: zod.number(),
	})
);
export type FlowStageType = zod.infer<typeof FlowStage>;

const Stage = CheckboxValidator.or(DateValidator)
	.or(DateRangeValidator)
	.or(NumberValidator)
	.or(SelectValidator)
	.or(TextValidator)
	.or(Title);
export type StageType = zod.infer<typeof Stage>;

const StageValidator = zod.array(Stage);

export const FormValidator = zod.object({
	stages: zod.array(
		zod
			.object({
				title: zod.string(),
				questions: StageValidator,
			})
			.or(StageValidator)
	),
	flow: zod.array(FlowStage),
});
export type Form = zod.infer<typeof FormValidator>;
export const getQuestions = (stage: Form['stages'][number]) =>
	'title' in stage ? stage.questions : stage;

export const BOOKING_FORM: Form = {
	stages: [
		/*0*/ {
			title: 'Personal Information',
			questions: [
				/*0.0*/ {
					type: 'text',
					prompt: 'Your name',
					required: true,
					id: 'name',
				},
				/*0.1*/ {
					type: 'text',
					prompt: 'Your email',
					required: true,
				},
				/*0.2*/ {
					type: 'text',
					prompt: 'Contact telephone',
				},
			],
		},
		/*1*/ [
			/*1.0*/ {
				type: 'title',
				text: 'Event Details',
			},
			/*1.1*/ {
				type: 'text',
				prompt: 'Event title',
				required: true,
			},
			/*1.2*/ {
				type: 'date-range',
				prompt: 'Event Date',
			},
			/*1.2*/ {
				type: 'text',
				prompt: 'Description',
				required: true,
			},
			/*1.3*/ {
				type: 'select',
				prompt: 'Setup time required',
				required: true,
				options: [
					{ value: '0', text: '0 - no setup required' },
					{
						value: '30',
						text: "30 mins - eg small presentations in Beacon / Sandy's",
					},
					{
						value: '60',
						text: '1 hour - eg club night in 601 or movie / presentation in StAge',
					},
					{ value: '90', text: '1.5 hours - eg full venue club night' },
					{
						value: '120',
						text: '2 hours - eg club night in 601 with decorations',
					},
					{
						value: '150',
						text: '2.5 hours - eg full venue club night with decorations',
					},
					{ value: '180', text: '3 hours - eg live music or ceilidh' },
					{
						value: '240',
						text: '4 hours - eg full venue with major decorations',
					},
					{ value: '300', text: '5 hours - eg dance or variety show' },
					{ value: '720', text: '12 hours - eg major act' },
					{
						value: '1560',
						text: '26-36 hours - eg over multiple days, catwalks',
					},
					{ value: 'other', text: 'Other' },
				],
			},
			/*1.4*/ {
				type: 'select',
				prompt: 'Event type',
				id: 'event-type',
				options: [
					'Club Night',
					'Live Music',
					'Meeting / conference',
					'Speaker',
					'Variety Show',
					'Other',
				],
				required: true,
			},
			/*1.5*/ {
				// TODO: is there a way to reference data to load in forms / queries on that data?
				type: 'select',
				prompt: 'Venue',
				// options: [],
				reference: 'venue',
				required: true,
			},
			/*1.6*/ {
				type: 'number',
				prompt: 'Expected attendance',
				required: true,
			},
			/*1.7*/ {
				type: 'checkbox',
				prompt: 'Will you charge for this event?',
				required: true,
			},
		],
		/*2*/ [
			/*2.0*/ {
				type: 'text',
				prompt: 'Setup time required',
				detail:
					'You specified "Other" as the setup time required - please describe, in detail, how much time you will need',
				required: true,
			},
		],
		/*3*/ [
			/*3.0*/ {
				type: 'text',
				prompt: 'Event type',
				detail:
					'You specified "Other" as the event type - please describe, in detail, your event type',
				required: true,
			},
		],
		/*4*/ [
			/*4.0*/ {
				type: 'text',
				prompt: 'Ticket cost',
				detail: 'Formatted as £0.00',
				required: true,
			},
		],
		/*5*/ [
			/*5.0*/ {
				type: 'checkbox',
				prompt: 'Do you require lighting',
				required: true,
			},
		],
	],
	flow: [
		0,
		1,
		{
			condition: [{ type: 'eq', target: 'event-type', value: 'Other' }],
			stages: 3,
		},
		{ condition: [{ type: 'eq', target: '1.8', value: true }], stages: 4 },
		{ condition: [{ type: 'eq', target: '1.4', value: 'other' }], stages: 2 },
	],
};

const StageMarker: React.FunctionComponent<{ text: string }> = (props) => (
	<div className={styles.marker}>
		<div />
		<span>{props.text}</span>
		<div />
		<FontAwesomeIcon icon={faTimesCircle} />
	</div>
);

export const FormEdit: React.FunctionComponent<
	Form & {
		onFormChange: (form: Form) => void;
	}
> = (props) => {
	// const [form, setForm] = useState(props);
	const { onFormChange, ...form } = props;
	const setForm = (form: Form) => props.onFormChange(form);

	const changeType = (
		form: Form,
		stage: number,
		index: number,
		type: string
	) => {
		const deepCopy = JSON.parse(JSON.stringify(form)) as Form;

		const stageElement = deepCopy.stages[stage];
		const questionArray =
			'title' in stageElement ? stageElement.questions : stageElement;
		const original = questionArray[index];

		if (original.type === 'title') return;

		switch (type) {
			case 'checkbox':
				questionArray[index] = {
					type: 'checkbox',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
				} as CheckboxConfiguration;
				break;
			case 'select':
				questionArray[index] = {
					type: 'select',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
					options: [],
				} as SelectOptionConfiguration;
				break;
			case 'text':
				questionArray[index] = {
					type: 'text',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
				} as TextConfiguration;
				break;
			case 'date':
				questionArray[index] = {
					type: 'date',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
				} as DateConfiguration;
				break;
			case 'date-range':
				questionArray[index] = {
					type: 'date-range',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
				} as DateRangeConfiguration;
				break;
			case 'number':
				questionArray[index] = {
					type: 'number',
					prompt: original.prompt,
					detail: original.detail,
					id: original.id,
					required: original.required,
				} as NumberConfiguration;
				break;
		}

		setForm(deepCopy);
	};

	const onMove =
		(form: Form, stage: number, index: number) => (d: 'up' | 'down') => {
			const deepCopy = JSON.parse(JSON.stringify(form));
			if (d === 'up' && index === 0) return;
			if (d === 'down' && index + 1 >= deepCopy.stages[stage].length) return;

			const temp = deepCopy.stages[stage][index + (d === 'up' ? -1 : 1)];
			deepCopy.stages[stage][index + (d === 'up' ? -1 : 1)] =
				deepCopy.stages[stage][index];
			deepCopy.stages[stage][index] = temp;

			setForm(deepCopy);
		};

	const onDelete = (form: Form, stage: number, index: number) => () => {
		const deepCopy = JSON.parse(JSON.stringify(form));
		delete deepCopy.stages[stage][index];
		setForm(deepCopy);
	};

	const onChange = (form: Form, stage: number, index: number) => (v: any) => {
		const deepCopy = JSON.parse(JSON.stringify(form));
		deepCopy.stages[stage][index] = v;
		setForm(deepCopy);
	};

	const convertStageToElements = (
		form: Form,
		stages: StageType,
		stage: number,
		index: number
	) => {
		switch (stages.type) {
			case 'number':
				return (
					<NumberEditPart
						{...stages}
						key={`number.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'text':
				return (
					<TextEditPart
						{...stages}
						key={`text.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'date':
				return (
					<DateEditPart
						{...stages}
						key={`date.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'select':
				return (
					<SelectEditPart
						{...stages}
						key={`select.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'checkbox':
				return (
					<CheckboxEditPart
						{...stages}
						key={`checkbox.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'date-range':
				return (
					<DateRangeEditPart
						{...stages}
						key={`date-range.${stage}.${index}`}
						onConfigurationChange={onChange(form, stage, index)}
						onDelete={onDelete(form, stage, index)}
						onMove={onMove(form, stage, index)}
						onTypeChange={(t) => changeType(form, stage, index, t)}
					/>
				);
			case 'title':
				return <h2 key={`title.${stage}.${index}`}>{stages.text}</h2>;
			default:
				return <div>Unknown</div>;
		}
	};

	const elements = form.stages
		.map((e, si) => {
			const title = 'title' in e ? `Stage ${si} : ${e.title}` : `Stage ${si}`;
			const questions = 'title' in e ? e.questions : e;
			return [<StageMarker text={title} />].concat(
				questions.map((v, vi) => convertStageToElements(form, v, si, vi))
			);
		})
		.flat();

	return <div className={styles.form}>{elements}</div>;
};

const FormEntry: React.FunctionComponent<
	Form & { onFormSubmit: (values: Record<string, any>) => void }
> = (props) => {
	const initial: Record<string, any> = {};
	props.stages.forEach((v, i) => {
		const questions = 'title' in v ? v.questions : v;
		questions.forEach((vi, ii) => {
			if ('value' in vi && vi.value) initial[`${i}.${ii}`] = vi.value;
			else if (vi.type === 'checkbox') initial[`${i}.${ii}`] = false;
		});
	});

	const [values, setValues] = useState<Record<string, any>>(initial);
	const [status, setStatus] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (status !== null && ref.current)
			ref.current.scrollIntoView({ behavior: 'smooth' });
	}, [status, ref]);

	// Evaluate flow
	const stages = (
		props.flow
			.map((e) => {
				if (typeof e === 'number') return [e];
				// See if the target has a value
				const matches = e.condition.every((condition) => {
					if (Object.prototype.hasOwnProperty.call(values, condition.target)) {
						switch (condition.type) {
							case 'eq':
								return condition.value === values[condition.target];
							case 'ne':
								return condition.value !== values[condition.target];
							case 'gt':
								return values[condition.target] > condition.value;
							case 'gte':
								return values[condition.target] >= condition.value;
							case 'lt':
								return values[condition.target] < condition.value;
							case 'lte':
								return values[condition.target] <= condition.value;
						}
					}
					return false;
				});

				if (matches) return e.stages;
				return null;
			})
			.filter((e) => e !== null) as number[][]
	).flat();

	const isFormValid = (): true | string => {
		for (const stageIndex of stages) {
			const stage = props.stages[stageIndex];
			const questions = 'title' in stage ? stage.questions : stage;

			for (let i = 0; i < questions.length; i++) {
				const element = questions[i];

				// TODO: apply regex and format checks here
				if ('required' in element && element.required) {
					if (
						!Object.prototype.hasOwnProperty.call(
							values,
							element.id ?? `${stageIndex}.${i}`
						)
					) {
						return `Question "${element.prompt}" is required`;
					}
				}
			}
		}

		return true;
	};

	const convertStageToElements = (
		stages: StageType,
		stage: number,
		index: number
	) => {
		switch (stages.type) {
			case 'number':
				return (
					<NumberPart
						{...stages}
						key={`number.${stage}.${index}`}
						onNumberChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]: v,
							}))
						}
					/>
				);
			case 'text':
				return (
					<TextPart
						{...stages}
						key={`text.${stage}.${index}`}
						onTextChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]: v,
							}))
						}
					/>
				);
			case 'date':
				return (
					<DatePart
						{...stages}
						key={`date.${stage}.${index}`}
						onDateChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]: v,
							}))
						}
					/>
				);
			case 'select':
				return (
					<SelectPart
						{...stages}
						key={`select.${stage}.${index}`}
						onSelectChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]:
									typeof v === 'string' ? v : v.value,
							}))
						}
					/>
				);
			case 'checkbox':
				return (
					<CheckboxPart
						{...stages}
						key={`checkbox.${stage}.${index}`}
						onCheckChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]: v,
							}))
						}
					/>
				);
			case 'date-range':
				return (
					<DateRangePart
						{...stages}
						key={`date-range.${stage}.${index}`}
						onDateRangeChange={(v) =>
							setValues((o) => ({
								...o,
								[stages.id ?? `${stage}.${index}`]: v,
							}))
						}
						//TODO: type conversion weirdness
					/>
				);
			case 'title':
				return <h2 key={`title.${stage}.${index}`}>{stages.text}</h2>;
			default:
				return <div>Unknown</div>;
		}
	};

	const elements: JSX.Element[] = [];
	for (const stageIndex of stages) {
		const stage = props.stages[stageIndex];
		const questions = 'title' in stage ? stage.questions : stage;
		questions.forEach((element, index) => {
			elements.push(convertStageToElements(element, stageIndex, index));
		});
	}

	return (
		<div className={styles.form}>
			{status ? (
				<div className={styles.error} ref={ref}>
					{status}
				</div>
			) : undefined}
			{elements}
			<Button
				color={Theme.BLUE}
				text="Submit"
				fullWidth
				onClick={() => {
					const validity = isFormValid();
					if (validity === true) {
						props.onFormSubmit(values);
					} else {
						setStatus(
							`${validity} - please correct the issues and submit again`
						);
					}
				}}
			/>
		</div>
	);
};
export default FormEntry;

export const FormDemo: React.FunctionComponent = () => {
	const userContext = useContext(GlobalContext);
	const [mode, setMode] = useState<'edit' | 'view'>('edit');
	const [form, setForm] = useState<Form>(BOOKING_FORM);

	let editor: React.ReactNode = null;
	const roles = userContext.user.value?.roles ?? [];
	if (roles.includes('ops') || roles.includes('admin'))
		editor = (
			<Button
				color={Theme.PURPLE}
				text={'Edit'}
				onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
			/>
		);

	if (mode === 'view') {
		return (
			<div>
				{editor}
				<FormEntry onFormSubmit={console.log} {...form} />
			</div>
		);
	}

	return (
		<div style={{ padding: '20px' }}>
			<FormEditor update={setForm} {...form} done={() => setMode('view')} />
		</div>
	);
};
