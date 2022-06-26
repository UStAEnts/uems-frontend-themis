import {StageType} from "../Form";
import React from "react";
import {CheckboxEditPart} from "../parts/Checkbox";
import {NumberEditPart} from "../parts/Number";
import {TextEditPart} from "../parts/Text";
import {DateEditPart} from "../parts/Date";
import {DateRangeEditPart} from "../parts/DateRange";
import {SelectEditPart} from "../parts/Select";
import { makeBlankConfig } from "./FormEditor";
import TitleEditor from "./TitleEditor";

export type FormStageEditorProps = {
    element: StageType,
    update: (stage: StageType) => void,
    move: (direction: 'up' | 'down') => void,
    remove: () => void,
};

const FormStageEditor: React.FunctionComponent<FormStageEditorProps> = (props): React.ReactElement => {
    const {element, move, update, remove} = props;

    if (element.type === 'title') {
        return (<TitleEditor title={element} onSave={props.update}/>)
    }

    switch (element.type) {
        case 'checkbox':
            return (
                <CheckboxEditPart onConfigurationChange={update}
                                  onTypeChange={(v) => update(makeBlankConfig(v, element))}
                                  onDelete={remove}
                                  onMove={move} {...element}/>);
        case 'number':
            return (
                <NumberEditPart onConfigurationChange={update}
                                onTypeChange={(v) => update(makeBlankConfig(v, element))}
                                onDelete={remove}
                                onMove={move} {...element}/>);
        case 'text':
            return (
                <TextEditPart onConfigurationChange={update}
                              onTypeChange={(v) => update(makeBlankConfig(v, element))}
                              onDelete={remove}
                              onMove={move} {...element}/>);
        case 'date':
            return (
                <DateEditPart onConfigurationChange={update}
                              onTypeChange={(v) => update(makeBlankConfig(v, element))}
                              onDelete={remove}
                              onMove={move} {...element}/>);
        case 'date-range':
            return (
                <DateRangeEditPart onConfigurationChange={update}
                                   onTypeChange={(v) => update(makeBlankConfig(v, element))}
                                   onDelete={remove}
                                   onMove={move} {...element}/>);
        case 'select':
            return (
                <SelectEditPart onConfigurationChange={update}
                                onTypeChange={(v) => update(makeBlankConfig(v, element))}
                                onDelete={remove}
                                onMove={move} {...element}/>);

    }
    return <>'unimplemented'</>;
};

export default FormStageEditor;