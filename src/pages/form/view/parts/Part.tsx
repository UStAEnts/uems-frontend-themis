import * as zod from 'zod';
import React, {useRef} from "react";
import styles from './parts.module.scss';
import {TextField} from "../../../../components/atoms/text-field/TextField";
import {classes} from "../../../../utilities/UIUtilities";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {KeyValueOption, Select} from "../../../../components/atoms/select/Select";
import {StageType} from "../Form";
import {Button} from "../../../../components/atoms/button/Button";
import {Theme} from "../../../../theme/Theme";

export const BasePart = zod.object({
    id: zod.string().optional(),
    prompt: zod.string(),
    detail: zod.string().optional(),
    required: zod.boolean().optional(),
});
export type BasePartType = zod.infer<typeof BasePart>;

type BasePartEditType = BasePartType & {
    onPromptChange: (prompt: string) => void;
    onDetailChange: (detail: string | undefined) => void;
    onRequiredChange: (required: boolean) => void,
    onTypeChange: (type: StageType['type']) => void,
    onMove: (direction: 'up' | 'down') => void,
    onDelete: () => void,
    type: string,
    className?: string
}

export const FormEditElement: React.FunctionComponent<BasePartEditType> = (props) => {
    const required = useRef<HTMLInputElement>(null);
    const options = [
        {value: 'select', text: 'Select'},
        {value: 'text', text: 'Text'},
        {value: 'checkbox', text: 'Checkbox'},
        {value: 'date', text: 'Date'},
        {value: 'date-range', text: 'Date Range'},
        {value: 'number', text: 'Number'},
    ];
    console.log(props.type);

    return (
        <div className={classes(styles.entry, styles.edit, props.className)}>
            <div className={styles.header}>
                <div className={styles.move}>
                    <FontAwesomeIcon
                        icon={faArrowUp}
                        onClick={() => props.onMove('up')}
                    />
                    <FontAwesomeIcon
                        icon={faArrowDown}
                        onClick={() => props.onMove('down')}
                    />
                </div>
                <TextField
                    onChange={(v: string) => props.onPromptChange(v)}
                    name={'header'}
                    initialContent={props.prompt}
                    className={styles.input}
                />
                <FontAwesomeIcon
                    icon={faTimesCircle}
                    onClick={() => props.onDelete()}
                />
                {/*{props.required ? (<div className={styles.required}>*</div>) : undefined}*/}
            </div>
            <div className={styles.detail}>
                {
                    props.detail !== undefined
                        ? (<TextField
                            onChange={(v: string) => props.onDetailChange(v)}
                            name={'detail'}
                            placeholder={'Detail (added description about this form entry)'}
                            initialContent={props.detail}
                            // className={styles.detail}
                        />)
                        : (<Button color={Theme.GRAY} text={'Add Detail'} onClick={() => {
                            props.onDetailChange('');
                        }}/>)
                }
            </div>
            <div className={styles.content}>
                {props.children}
            </div>
            <div className={styles.bottom}>
                <div className={styles.requiredSelect}>
                    <label>Required? </label>
                    <input
                        type='checkbox'
                        style={{width: 'auto'}}
                        ref={required}
                        onChange={() => props.onRequiredChange(required.current?.checked ?? false)}
                    />
                </div>
                <div className={styles.typeSelect}>
                    <Select
                        placeholder={'Component type'}
                        name={'type'}
                        options={options}
                        initialOption={options.find((e) => e.value === props.type)}
                        onSelectListener={(v: KeyValueOption) => props.onTypeChange(v.value as StageType['type'])}
                    />
                </div>
            </div>
        </div>
    );
}

const FormElement: React.FunctionComponent<BasePartType> = (props) => (
    <div className={styles.entry}>
        <div className={styles.header}>
            {props.prompt}
            {props.required ? (<div className={styles.required}>*</div>) : undefined}
        </div>
        {props.detail ? (<div className={styles.detail}>{props.detail}</div>) : undefined}
        {props.children}
    </div>
)
export default FormElement;