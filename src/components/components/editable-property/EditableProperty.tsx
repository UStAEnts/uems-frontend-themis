import React from "react";
import { Select } from "../../atoms/select/Select";
import { Button } from "../../atoms/button/Button";
import { Theme } from "../../../theme/Theme";

import "./EditableProperty.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-flatpickr";

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
    name: string,
    children: React.ReactNode | React.ReactNode[],
    config: SelectType | DateType,
}

export type EditablePropertyStateType = {
    editMode: boolean,
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

    private enableEditing = () => {
        this.setState((oldState) => ({
            ...oldState,
            editMode: true,
        }));
    }

    private disableEditing = () => {
        this.setState((oldState) => ({
            ...oldState,
            editMode: false,
        }));
    }

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

    private renderDefault() {
        return (
            <div className="editable-property">
                {this.props.children}
                <span
                    className="edit"
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
