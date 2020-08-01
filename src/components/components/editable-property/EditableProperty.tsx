import React from 'react';
import { KeyValueOption, Select } from '../../atoms/select/Select';
import { Button } from '../../atoms/button/Button';
import { Theme } from '../../../theme/Theme';

import './EditableProperty.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-flatpickr';
import InputUtilities from '../../../utilities/InputUtilities';
import { TextField, TextFieldPropsType } from '../../atoms/text-field/TextField';
import { IconSelector, OptionType } from "../../atoms/icon-picker/EntrySelector";
import { TwitterPicker } from "react-color";
import { failEarlyStateSet } from "../../../utilities/AccessUtilities";

export type IconType = {
    type: 'icon',
    onChange?: (value: OptionType) => void,
    value: string,
}

export type ColorType = {
    type: 'color',
    onChange?: (value: string) => void,
    value: string,
}

export type SelectType = {
    type: 'select',
    options: string[] | KeyValueOption[],
    onChange?: (newValue: string | KeyValueOption) => void,
};

export type DateType = {
    type: 'date',
    value?: Date,
    onChange?: (newValue: Date) => void,
}

export type TextType = {
    type: 'text',
    value?: any,
    onChange?: (newValue: any) => void,
    fieldType?: TextFieldPropsType['type'],
}

export type EditablePropertyPropsType = {
    /**
     * The name of the property which should be edited. This will be passed to the control where elevant
     */
    name: string,
    /**
     * An editable property must contain one or more children which are rendered by default when not in edit mode
     */
    children: React.ReactNode | React.ReactNode[],
    config: SelectType | DateType | TextType | ColorType | IconType,
}

export type EditablePropertyStateType = {
    /**
     * If the field is currently being edited
     */
    editMode: boolean,
    /**
     * The currently selected property from the select box
     */
    selectProperty?: string | KeyValueOption | OptionType,
    selectedTime?: Date,
    input?: any,
};

export class EditableProperty extends React.Component<EditablePropertyPropsType, EditablePropertyStateType> {

    static displayName = 'EditableProperty';

    constructor(props: Readonly<EditablePropertyPropsType>) {
        super(props);

        this.state = {
            editMode: false,
            input: Object.prototype.hasOwnProperty.call(props.config, 'value')
                ? (props.config as any).value
                : undefined,
        };

    }

    /**
     * Updates the state to enable the edit mode
     */
    private enableEditing = () => {
        this.setState((oldState) => ({
            ...oldState,
            editMode: true,
        }));
    }

    /**
     * Updates the state to disable the edit mode
     */
    private disableEditing = () => {
        this.setState((oldState) => ({
            ...oldState,
            editMode: false,
        }));
    }

    /**
     * Updates the state when a new value is provided. To be called when the select has a new value
     * @param option the newly selected option
     */
    private onSelectChange = (option: string | KeyValueOption) => {
        this.setState((oldState) => ({
            ...oldState,
            selectProperty: option,
        }));
    }

    private onTimeChange = (date: Date[]) => {
        if (date.length > 0 && date[0]) {
            this.setState((oldState) => ({
                ...oldState,
                selectedTime: date[0],
            }));
        }
    }

    private onTextChange = (value: any) => {
        this.setState((oldState) => ({
            ...oldState,
            input: value,
        }));
    }
    /**
     * If the selected property has been updated, it will disable editing and then call the onChange listener if one
     * has been provided
     */

    private saveProperty = () => {
        if (this.state.selectProperty === undefined
            && this.state.selectedTime === undefined
            && this.state.input === undefined) return;

        this.disableEditing();

        if (this.props.config.type === 'select' && this.state.selectProperty) {
            if (this.props.config.onChange) {
                this.props.config.onChange(
                    this.state.selectProperty as (string | KeyValueOption),
                );
            }
        }
        if (this.props.config.type === 'date' && this.state.selectedTime) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.selectedTime);
        }
        if (this.props.config.type === 'text' && this.state.input) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.input);
        }
        if (this.props.config.type === 'icon' && this.state.selectProperty) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.selectProperty as OptionType);
        }
        if (this.props.config.type === 'color' && this.state.selectProperty) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.selectProperty as string);
        }
    }

    private renderIcon = () => (
        <IconSelector
            onSelect={failEarlyStateSet(this.state, this.setState.bind(this), 'selectProperty')}
            value={this.state.selectProperty as OptionType}
            searchable
        />
    );

    private renderColor = () => (
        <TwitterPicker
            onChange={(a) => {
                failEarlyStateSet(this.state, this.setState.bind(this), 'selectProperty')(a.hex);
            }}
            color={this.state.selectProperty as (string | undefined)}
        />
    );

    private renderSelect = (select: SelectType) => {
        if (select.options.length > 0 && typeof (select.options[0]) === 'string') {
            return (
                <Select
                    placeholder={this.props.name}
                    name={this.props.name}
                    options={select.options as string[]}
                    onSelectListener={this.onSelectChange}
                    initialOption={this.state.selectProperty as string}
                />
            );
        }

        return (
            <Select
                placeholder={this.props.name}
                name={this.props.name}
                options={select.options as KeyValueOption[]}
                onSelectListener={this.onSelectChange}
                initialOption={this.state.selectProperty as KeyValueOption}
            />
        );
    }

    private renderEditField = () => {
        switch (this.props.config.type) {
            case 'date':
                return (
                    <DatePicker
                        data-enable-time
                        onChange={this.onTimeChange}
                        value={this.props.config.value}
                    />
                );
            case 'select':
                return (
                    this.renderSelect(this.props.config)
                );
            case 'text':
                return (
                    <TextField
                        onChange={this.onTextChange}
                        name={this.props.name}
                        initialContent={this.state.input}
                        type={this.props.config.fieldType}
                    />
                );
            case 'color':
                return (
                    <div>
                        <TextField
                            style={{
                                borderBottom: `5px solid ${this.state.selectProperty ?? '#000000'}`,
                            }}
                            onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'selectProperty')}
                            name="Color"
                            initialContent={(this.state.selectProperty as (string | undefined)) ?? '#000000'}
                        />

                        {this.renderColor()}
                    </div>
                );
            case 'icon':
                return (this.renderIcon());
            default:
                return undefined;
        }
    }

    /**
     * Renders the edit field which has a header and a select field with a save and cancel for the user to pick their
     * choice
     */
    private renderEdit() {
        return (
            <div
                className="editable-property"
            >
                <p>Please select a new value for this property</p>
                {this.renderEditField()}
                <div className="buttons">
                    <Button
                        color={Theme.SUCCESS}
                        onClick={this.saveProperty}
                        text="Save"
                    />
                    <Button
                        color={Theme.FAILURE}
                        onClick={this.disableEditing}
                        text="Cancel"
                    />
                </div>
            </div>
        );
    }

    /**
     * Renders the default property which contains the children passed and a font awesome icon box and the text 'edit'
     */
    private renderDefault() {
        return (
            <div className="editable-property">
                {this.props.children}
                <span
                    className="edit"
                    role="button"
                    tabIndex={0}
                    onKeyPress={InputUtilities.higherOrderPress(InputUtilities.SPACE, this.enableEditing, this)}
                    onClick={this.enableEditing}
                >
                    <FontAwesomeIcon icon={faEdit} />
                    (Edit...)
                </span>
            </div>
        );
    }

    render() {
        return this.state.editMode
            ? this.renderEdit()
            : this.renderDefault();

    }

}
