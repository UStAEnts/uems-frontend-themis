import React from "react";
import { Select } from "../../atoms/select/Select";
import { Button } from "../../atoms/button/Button";
import { Theme } from "../../../theme/Theme";

import "./EditableProperty.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-flatpickr";
import InputUtilities from "../../../utilities/InputUtilities";

export type SelectType = {
    type: 'select',
    options: string[] | { key: string, value: string }[],
    onChange?: (newValue: string | { key: string, value: string }) => void,
};

export type DateType = {
    type: 'date',
    value?: Date,
    onChange?: (newValue: Date) => void,
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
    config: SelectType | DateType,
}

export type EditablePropertyStateType = {
    /**
     * If the field is currently being edited
     */
    editMode: boolean,
    /**
     * The currently selected property from the select box
     */
    selectProperty?: string | { key: string, value: string },
    selectedTime?: Date,
};

export class EditableProperty extends React.Component<EditablePropertyPropsType, EditablePropertyStateType> {

    static displayName = "EditableProperty";

    constructor(props: Readonly<EditablePropertyPropsType>) {
        super(props);

        this.state = {
            editMode: false,
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
    private onSelectChange = (option: string | { key: string, value: string }) => {
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
    /**
     * If the selected property has been updated, it will disable editing and then call the onChange listener if one
     * has been provided
     */

    private saveProperty = () => {
        if (this.state.selectProperty === undefined && this.state.selectedTime === undefined) return;

        this.disableEditing();

        if (this.props.config.type === 'select' && this.state.selectProperty) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.selectProperty);
        }
        if (this.props.config.type === 'date' && this.state.selectedTime) {
            if (this.props.config.onChange) this.props.config.onChange(this.state.selectedTime);
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
                {this.props.config.type === 'select'
                    ? (
                        <Select
                            placeholder={this.props.name}
                            name={this.props.name}
                            options={this.props.config.options}
                            onSelectListener={this.onSelectChange}
                            initialOption={this.state.selectProperty}
                        />
                    )
                    : (
                        <DatePicker
                            data-enable-time
                            onChange={this.onTimeChange}
                            value={this.props.config.value}
                        />
                    )}
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
        )
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
        )
    }

    render() {
        return this.state.editMode
            ? this.renderEdit()
            : this.renderDefault();

    }

};
