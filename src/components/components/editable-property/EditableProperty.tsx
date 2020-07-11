import React from "react";
import { Select } from "../../atoms/select/Select";
import { Button } from "../../atoms/button/Button";
import { Theme } from "../../../theme/Theme";

import "./EditableProperty.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

export type EditablePropertyPropsType = {
    /**
     * The name of the property which should be edited. This will be passed to the control where elevant
     */
    name: string,
    /**
     * An editable property must contain one or more children which are rendered by default when not in edit mode
     */
    children: React.ReactNode | React.ReactNode[],
    /**
     * The set of options to be displayed in the select box
     */
    options: string[] | { key: string, value: string }[],
    /**
     * The change function to be called when the user saves a new value
     * @param newValue the new value the user selected
     */
    onChange?: (newValue: string | { key: string, value: string }) => void,
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
};

export class EditableProperty extends React.Component<EditablePropertyPropsType, EditablePropertyStateType> {

    static displayName = "EditableProperty";

    constructor(props: Readonly<EditablePropertyPropsType>) {
        super(props);

        this.state = {
            editMode: false,
        };

        this.enableEditing = this.enableEditing.bind(this);
        this.disableEditing = this.disableEditing.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.saveProperty = this.saveProperty.bind(this);
    }

    /**
     * Updates the state to enable the edit mode
     */
    private enableEditing() {
        this.setState((oldState) => ({
            ...oldState,
            editMode: true,
        }));
    }

    /**
     * Updates the state to disable the edit mode
     */
    private disableEditing() {
        this.setState((oldState) => ({
            ...oldState,
            editMode: false,
        }));
    }

    /**
     * Updates the state when a new value is provided. To be called when the select has a new value
     * @param option the newly selected option
     */
    private onSelectChange(option: string | { key: string, value: string }) {
        this.setState((oldState) => ({
            ...oldState,
            selectProperty: option,
        }));
    }

    /**
     * If the selected property has been updated, it will disable editing and then call the onChange listener if one
     * has been provided
     */
    private saveProperty() {
        if (this.state.selectProperty === undefined) return;

        this.disableEditing();
        if (this.props.onChange) this.props.onChange(this.state.selectProperty);
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
                <Select
                    placeholder={this.props.name}
                    name={this.props.name}
                    options={this.props.options}
                    onSelectListener={this.onSelectChange}
                    initialOption={this.state.selectProperty}
                />
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
                    onClick={this.enableEditing}
                >
                    <FontAwesomeIcon icon={faEdit}/>
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
