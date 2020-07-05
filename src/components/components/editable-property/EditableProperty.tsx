import React from "react";
import { Select } from "../../atoms/select/Select";
import { Button } from "../../atoms/button/Button";
import { Theme } from "../../../theme/Theme";

import "./EditableProperty.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

export type EditablePropertyPropsType = {
    name: string,
    children: React.ReactNode | React.ReactNode[],
    options: string[] | { key: string, value: string }[],
    onChange?: (newValue: string | { key: string, value: string }) => void,
}

export type EditablePropertyStateType = {
    editMode: boolean,
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

    private enableEditing() {
        this.setState((oldState) => ({
            ...oldState,
            editMode: true,
        }));
    }

    private disableEditing() {
        this.setState((oldState) => ({
            ...oldState,
            editMode: false,
        }));
    }

    private onSelectChange(option: string | { key: string, value: string }) {
        this.setState((oldState) => ({
            ...oldState,
            selectProperty: option,
        }));
    }

    private saveProperty() {
        if (this.state.selectProperty === undefined) return;

        this.disableEditing();
        if (this.props.onChange) this.props.onChange(this.state.selectProperty);
    }

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
