import * as zod from 'zod';
import FormElement, {BasePart, FormEditElement} from "./Part";
import React, {useState} from "react";
import {TextField} from "../../../../components/atoms/text-field/TextField";
import {StageType} from "../Form";

export const DateValidator = BasePart.extend({
    type: zod.literal('date'),
    value: zod.number().optional(),
});

export type DateConfiguration = zod.infer<typeof DateValidator>;

export const DateEditPart: React.FunctionComponent<DateConfiguration & {
    onConfigurationChange: (change: DateConfiguration) => void,
    onTypeChange: (type: StageType['type']) => void,
    onDelete: () => void,
    onMove: (direction: 'up' | 'down') => void,
}> = (props) => {
    return (
        <FormEditElement
            onPromptChange={(v) => props.onConfigurationChange({...props, prompt: v})}
            onDetailChange={(v) => props.onConfigurationChange({...props, detail: v})}
            onRequiredChange={(v) => props.onConfigurationChange({...props, required: v})}
            {...props}
        >
            Nothing to configure!
        </FormEditElement>
    )
}

const DatePart: React.FunctionComponent<DateConfiguration & { onDateChange?: (value: Date) => void }> = (props) => {
    const [date, setDate] = useState<Date | null>(props.value ? new Date(props.value * 1000) : null);
    const func = props.onDateChange ?? (() => undefined);

    return (
        <FormElement
            detail={props.detail}
            required={props.required}
            prompt={props.prompt}
        >
            <TextField
                onChange={(value: Date) => {
                    setDate(value)
                    func(value);
                }}
                name={'date'}
                type='datetime'
                initialContent={date ?? undefined}
            />
            {/*<SingleDatePicker*/}
            {/*    id={'date'}*/}
            {/*    date={date}*/}
            {/*    focused={focus}*/}
            {/*    displayFormat='DD/MM/yyyy'*/}
            {/*    onDateChange={(d) => {*/}
            {/*        if (d) func(d.toDate())*/}
            {/*        setDate(d as Moment);*/}
            {/*    }}*/}
            {/*    onFocusChange={(p) => setFocus(p.focused)}*/}
            {/*/>*/}
        </FormElement>
    )
}

export default DatePart;