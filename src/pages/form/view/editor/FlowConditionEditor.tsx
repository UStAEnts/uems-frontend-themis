import {ComparisonType, StageType} from "../Form";
import {KeyValueOption, Select} from "../../../../components/atoms/select/Select";
import React, {useState} from "react";
import {TextField} from "../../../../components/atoms/text-field/TextField";
import {Button} from "../../../../components/atoms/button/Button";
import {Theme} from "../../../../theme/Theme";

export type FlowConditionEditorProps = {
    flow?: ComparisonType,
    onSave: (flow: ComparisonType) => void,
    questions: KeyValueOption[],
    stage: number,
}

const FlowConditionEditor: React.FunctionComponent<FlowConditionEditorProps> = (props) => {
    const {flow, onSave, questions, stage} = props;

    const operators = [
        {
            value: 'eq',
            label: 'is equal to',
            requirement: ['number', 'text', 'date', 'date-range', 'select', 'checkbox']
        },
        {
            value: 'ne',
            label: 'is not equal to',
            requirement: ['number', 'text', 'date', 'date-range', 'select', 'checkbox']
        },
        {value: 'gt', label: 'is greater than', requirement: ['number']},
        {value: 'gte', label: 'is greater than or equal to', requirement: ['number']},
        {value: 'lt', label: 'is less than', requirement: ['number']},
        {value: 'lte', label: 'is less than or equal to', requirement: ['number']},
    ];
    const convert = (c?: { value: string, label: string, requirement: string[] }): KeyValueOption | undefined => (
        c
            ? {value: c.value, text: c.label}
            : undefined
    );

    let matched: { stage: number, index: number, entry: StageType } | undefined = undefined;
    if (flow !== undefined) {
        if (/\d+.\d+/.test(flow.target)) {
            // Index based
            const [stage, index] = flow.target.split('.').map((e) => Number(e));
            let temp = questions.find((e) => e.additional.stage === stage && e.additional.index === index);
            if (temp !== undefined) matched = temp.additional;
        } else {
            let temp = questions.find((e) => e.additional.entry.id === flow.target);
            if (temp !== undefined) matched = temp.additional;
        }
    }

    const [selectedQuestion, setSelectedQuestion] = useState<{ stage: number, index: number, entry: StageType } | undefined>(
        matched,
    );
    const [selectedOperator, setSelectedOperator] = useState<KeyValueOption | undefined>(
        convert(operators.find((e) => e.value === flow?.type))
    );
    const [selectedComparison, setSelectedComparison] = useState<string | number>(flow?.value);

    // console.log(flow, selectedQuestion, selectedOperator, selectedComparison);

    return (
        <div>
            <Select placeholder={'When question'}
                    name={'question'}
                    options={questions}
                    initialOption={questions.find((e) => e.additional.stage === selectedQuestion?.stage && e.additional.index === selectedQuestion?.index)}
                    onSelectListener={(v: any) => setSelectedQuestion(v.additional)}
            />
            <Select placeholder={'Operator'}
                    key={selectedQuestion ? `${selectedQuestion.stage}:${selectedQuestion.entry}` : 'unset'}
                    name={'op'}
                    initialOption={selectedOperator}
                    onSelectListener={(v: KeyValueOption) => setSelectedOperator(v)}
                    options={
                        operators
                            .filter((e) => e.requirement.includes(selectedQuestion?.entry?.type as string))
                            .map(convert)
                            .filter((e) => e !== undefined) as KeyValueOption[]
                    }
            />
            <TextField onChange={(v: any) => setSelectedComparison(v)}
                       type={selectedQuestion?.entry.type === 'number' ? 'number' : 'text'}
                       name={'Comparison'}
                       initialContent={selectedComparison as any}
            />
            <Button color={Theme.GREEN} text={'Save'} onClick={() => {
                if (selectedQuestion !== undefined && selectedOperator !== undefined) {
                    onSave({
                        value: selectedComparison,
                        type: selectedOperator.value as any,
                        target: (selectedQuestion.entry as any)?.id ?? `${selectedQuestion.stage}.${selectedQuestion.index}`,
                    });
                }
            }}/>
        </div>
    );
};

export default FlowConditionEditor;