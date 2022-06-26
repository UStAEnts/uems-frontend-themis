import FormElement, {BasePart, FormEditElement} from "./Part";
import * as zod from 'zod';
import React, {useEffect, useRef, useState} from "react";
import {TextField} from "../../../../components/atoms/text-field/TextField";
import {KeyValueOption, Select} from "../../../../components/atoms/select/Select";
import {API} from "../../../../utilities/APIGen";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from './parts.module.scss';
import {Button} from "../../../../components/atoms/button/Button";
import {Theme} from "../../../../theme/Theme";
import {StageType} from "../Form";

export const OptionValidator = zod.string().or(zod.object({
    text: zod.string(),
    value: zod.string(),
}));
export type Option = zod.infer<typeof OptionValidator>;

const SelectOptionValidator = BasePart.extend({
    type: zod.literal('select'),
    value: zod.string().or(OptionValidator).optional(),
    options: zod.array(OptionValidator),
});
const SelectReferenceValidator = BasePart.extend({
    type: zod.literal('select'),
    value: zod.string().or(OptionValidator).optional(),
    reference: zod.enum(['venue', 'event', 'state', 'ents', 'topic']).or(zod.object({
        data: zod.enum(['venue', 'event', 'state', 'ents', 'topic']),
        query: zod.string(),
    })),
})
export const SelectValidator = SelectOptionValidator.or(SelectReferenceValidator);

type Props = { onSelectChange?: (value: Option) => void };
export type SelectOptionConfiguration = zod.infer<typeof SelectOptionValidator>;
export type SelectReferenceConfiguration = zod.infer<typeof SelectReferenceValidator>;
export type SelectConfiguration = zod.infer<typeof SelectValidator>;
export type SelectProps = SelectConfiguration & Props;

const SelectOptionPart: React.FunctionComponent<SelectOptionConfiguration & Props> = (props) => {
    const update = props.onSelectChange ?? (() => undefined);
    const options: KeyValueOption[] = [];
    props.options.forEach((e) => typeof (e) === 'string'
        ? options.push({text: e, value: e})
        : options.push(e)
    );

    return (
        <FormElement
            detail={props.detail}
            required={props.required}
            prompt={props.prompt}
        >
            <Select
                placeholder={''}
                name={''}
                options={options}
                initialOption={props.value as any}
                onSelectListener={update}
                style={{margin: '10px', background: 'white'}}
            />
        </FormElement>
    );
}


export const SelectEditPart: React.FunctionComponent<SelectConfiguration & {
    onConfigurationChange: (change: SelectConfiguration) => void,
    onTypeChange: (type: StageType['type']) => void,
    onDelete: () => void,
    onMove: (direction: 'up' | 'down') => void,
}> = (props) => {
    const [mode, setMode] = useState<'option' | 'reference'>('reference' in props ? 'reference' : 'option');
    const referenceCheckbox = useRef<HTMLInputElement>(null);

    let element;
    if (mode === 'reference') {
        let initialOption = undefined;
        if ('reference' in props){
            initialOption = typeof(props.reference) === 'string' ? props.reference : props.reference.data;
        }

        element = (<div>
            <Select
                placeholder={'Reference'}
                name={'Reference'}
                onSelectListener={(value: KeyValueOption) => {
                    props.onConfigurationChange({
                        ...props,
                        options: undefined,
                        reference: value.value as any,
                    });
                }}
                options={[
                    {text: 'Venues', value: 'venue'},
                    {text: 'Events', value: 'event'},
                    {text: 'States', value: 'state'},
                    {text: 'Ents States', value: 'ents'},
                    {text: 'Topics', value: 'topic'},
                ]}
                initialOption={initialOption}
            />
        </div>)
    } else if ('options' in props && props.options !== undefined) {
        element = (
            <>
                <ul className={styles.list}>
                    {props.options.map((v, index) => {
                        if (typeof (v) === 'string') {
                            return (<li key={v}>
                                <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    onClick={() => {
                                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                                        const deepCopy = JSON.parse(JSON.stringify(rest));
                                        deepCopy.options.splice(index, 1);
                                        props.onConfigurationChange(deepCopy);
                                    }}
                                />
                                <TextField
                                    onChange={(v: string) => {
                                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                                        const deepCopy = JSON.parse(JSON.stringify(rest));
                                        deepCopy.options[index] = v;
                                        props.onConfigurationChange(deepCopy);
                                    }}
                                    name={'Prompt'}
                                    initialContent={v}
                                />
                            </li>)
                        } else {
                            return (<li key={v.value}>
                                <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    onClick={() => {
                                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                                        const deepCopy = JSON.parse(JSON.stringify(rest));
                                        deepCopy.options.splice(index, 1);
                                        props.onConfigurationChange(deepCopy);
                                    }}
                                />
                                <TextField
                                    onChange={(update: string) => {
                                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                                        const deepCopy = JSON.parse(JSON.stringify(rest));
                                        deepCopy.options[index] = {text: v.text, value: update};
                                        props.onConfigurationChange(deepCopy);
                                    }}
                                    name={'Value'}
                                    initialContent={v.value}
                                />
                                <TextField
                                    onChange={(update: string) => {
                                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                                        const deepCopy = JSON.parse(JSON.stringify(rest));
                                        deepCopy.options[index] = {text: update, value: v.value};
                                        props.onConfigurationChange(deepCopy);
                                    }}
                                    name={'User String'}
                                    initialContent={v.text}
                                />
                            </li>)
                        }
                    })}
                </ul>
                <Button
                    color={Theme.BLUE}
                    text='Add new entry'
                    onClick={() => {
                        const {onConfigurationChange, onTypeChange, onDelete, onMove, ...rest} = props;
                        const deepCopy = JSON.parse(JSON.stringify(rest));

                        if (deepCopy.options.length === 0) {
                            deepCopy.options.push('');
                        } else {
                            if (typeof (deepCopy.options[0]) === 'string') {
                                deepCopy.options.push('');
                            } else {
                                deepCopy.options.push({text: '', value: ''});
                            }
                        }

                        props.onConfigurationChange(deepCopy);
                    }}
                />
            </>)
    }

    return (
        <FormEditElement
            onPromptChange={(v) => props.onConfigurationChange({...props, prompt: v})}
            onDetailChange={(v) => props.onConfigurationChange({...props, detail: v})}
            onRequiredChange={(v) => props.onConfigurationChange({...props, required: v})}
            className={styles.select}
            {...props}
        >
            <div style={{display: 'flex', alignItems: 'self'}}>
                <label>Use reference</label>
                <input
                    style={{width: 'auto', margin: 0, marginLeft: '10px'}}
                    type='checkbox'
                    checked={mode === 'reference'}
                    ref={referenceCheckbox}
                    onChange={() => setMode(referenceCheckbox.current?.checked ? 'reference' : 'option')}
                />
            </div>
            {element}
        </FormEditElement>
    )
}


const SelectReferencePart: React.FunctionComponent<SelectReferenceConfiguration & Props> = (props) => {
    const [loadingState, setLoadingState] = useState<undefined | 'started' | 'loaded' | string>(undefined);
    const [data, setData] = useState<KeyValueOption[] | undefined>(undefined);

    useEffect(() => {
        if (loadingState !== undefined) return;

        setLoadingState('started');
        const target = typeof (props.reference) === 'string' ? props.reference : props.reference.data;
        // TODO: reintroduce query
        // const query = typeof (props.reference) === 'string' ? '' : props.reference.query;
        switch (target) {
            case 'state':
                // TODO: query
                API.states.get().then((v) => {
                    setData(v.result.map((e) => ({
                        text: e.name,
                        value: e.id,
                    })));
                    setLoadingState('loaded');
                }).catch((e) => setLoadingState('Failed to load: ' + e.message));
                break;
            case 'event':
                // TODO: query
                API.events.get().then((v) => {
                    setData(v.result.map((e) => ({
                        text: e.name,
                        value: e.id,
                    })));
                    setLoadingState('loaded');
                }).catch((e) => setLoadingState('Failed to load: ' + e.message));
                break;
            case 'venue':
                API.venues.get().then((v) => {
                    setData(v.result.map((e) => ({
                        text: e.name,
                        value: e.id,
                    })));
                    setLoadingState('loaded');
                }).catch((e) => setLoadingState('Failed to load: ' + e.message));
                break;
            case 'ents':
                API.ents.get().then((v) => {
                    setData(v.result.map((e) => ({
                        text: e.name,
                        value: e.id,
                    })));
                    setLoadingState('loaded');
                }).catch((e) => setLoadingState('Failed to load: ' + e.message));
                break;
            case 'topic':
                API.topics.get().then((v) => {
                    setData(v.result.map((e) => ({
                        text: e.name,
                        value: e.id,
                    })));
                    setLoadingState('loaded');
                }).catch((e) => setLoadingState('Failed to load: ' + e.message));
                break;
        }
    }, [loadingState, props.reference]);

    if (loadingState === 'loaded' && data !== undefined) {
        return (<SelectOptionPart
            onSelectChange={props.onSelectChange}
            options={data}
            value={props.value}
            type={props.type}
            id={props.id}
            prompt={props.prompt}
            required={props.required}
            detail={props.detail}
        />)
    }

    if (loadingState === 'started') {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>Failed to load: {loadingState}</div>
    )
}

const SelectPart: React.FunctionComponent<SelectProps> = (props) => {
    if ('reference' in props) {
        return (<SelectReferencePart {...props}/>);
    } else {
        return (<SelectOptionPart {...props}/>);
    }
}

export default SelectPart;