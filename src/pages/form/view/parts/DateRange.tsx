import * as zod from 'zod';
import FormElement, { BasePart, FormEditElement } from './Part';
import React, { useState } from 'react';
import { Moment } from 'moment';
import styles from './parts.module.scss';
import { TextField } from '../../../../components/atoms/text-field/TextField';
import { StageType } from '../Form';

export const DateRangeValidator = BasePart.extend({
	type: zod.literal('date-range'),
	value: zod
		.object({
			start: zod.number(),
			end: zod.number(),
		})
		.optional(),
});

type DateState = {
	start: Moment | null;
	end: Moment | null;
};

export type DateRangeConfiguration = zod.infer<typeof DateRangeValidator>;

export const DateRangeEditPart: React.FunctionComponent<
	DateRangeConfiguration & {
		onConfigurationChange: (change: DateRangeConfiguration) => void;
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

const DateRangePart: React.FunctionComponent<
	DateRangeConfiguration & {
		onDateRangeChange?: (start: Date | null, end: Date | null) => void;
	}
> = (props) => {
	const [start, setStart] = useState<Date | null>(
		props.value ? new Date(props.value.start * 1000) : null
	);
	const [end, setEnd] = useState<Date | null>(
		props.value ? new Date(props.value.end * 1000) : null
	);
	const func = props.onDateRangeChange ?? (() => undefined);

	return (
		<FormElement
			detail={props.detail}
			required={props.required}
			prompt={props.prompt}
		>
			<br />
			<div className={styles.dateRange}>
				<TextField
					onChange={(v: Date) => {
						setStart(v);
						func(v, end);
					}}
					name={'Start Date'}
					type="datetime"
					initialContent={start ?? undefined}
				/>
				<TextField
					onChange={(v: Date) => {
						setEnd(v);
						func(start, v);
					}}
					name={'End Date'}
					type="datetime"
					initialContent={end ?? undefined}
				/>
			</div>
			{/*<DateRangePicker*/}
			{/*    displayFormat='DD/MM/yyyy'*/}
			{/*    onFocusChange={(p) => setFocus(p)}*/}
			{/*    startDate={start}*/}
			{/*    endDate={end}*/}
			{/*    focusedInput={focus}*/}
			{/*    onDatesChange={(d) => {*/}
			{/*        console.log(d);*/}
			{/*        if(d.startDate !== start) setStart(d.startDate as (Moment | null));*/}
			{/*        if(d.endDate !== end) setEnd(d.endDate as (Moment | null));*/}
			{/*        func(d.startDate?.toDate() ?? null, d.endDate?.toDate() ?? null);*/}
			{/*    }}*/}
			{/*    startDateId=''*/}
			{/*    endDateId=''*/}
			{/*/>*/}
		</FormElement>
	);
};

export default DateRangePart;
