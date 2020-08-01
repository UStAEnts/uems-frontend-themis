import React, { CSSProperties } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EditableProperty } from '../../components/editable-property/EditableProperty';

import './ValueSquare.scss';
import { Theme } from "../../../theme/Theme";
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { withNotificationContext } from "../../WithNotificationContext";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export type ValueSquarePropsType = {
    value: string | number,
    icon?: IconDefinition,
    name?: string,
    editable?: boolean,
    onChange?: (value: string | number) => void,
    link?: string,
    style?: CSSProperties,
    className?: string,
    color?: string,
} & RouteComponentProps;

export type ValueSquareStateType = {};

class ValueSquareClass extends React.Component<ValueSquarePropsType, ValueSquareStateType> {

    static displayName = 'ValueSquare';

    private generateHeader = () => {
        if (this.props.icon && this.props.name) {
            return (
                <div className="icon" style={{ background: this.props.color ?? Theme.NOTICE }}>
                    <FontAwesomeIcon icon={this.props.icon} size="lg" />
                    <div className="name">{this.props.name}</div>
                </div>
            );
        }

        if (this.props.icon && !this.props.name) {
            return (
                <div className="icon no-name" style={{ background: this.props.color ?? Theme.NOTICE }}>
                    <FontAwesomeIcon icon={this.props.icon} size="lg" />
                </div>
            );
        }

        if (!this.props.icon && this.props.name) {
            return (
                <div className="icon only-name" style={{ background: this.props.color ?? Theme.NOTICE }}>
                    <div className="name">{this.props.name}</div>
                </div>
            );
        }

        return undefined;
    }

    render() {
        let value;

        if (this.props.editable) {
            if (typeof (this.props.value) === 'string') {
                value = (
                    <EditableProperty
                        name="value"
                        config={{
                            type: 'text',
                            value: this.props.value,
                            onChange: this.props.onChange,
                        }}
                    >
                        {this.props.value}
                    </EditableProperty>
                );
            } else {
                value = (
                    <EditableProperty
                        name="value"
                        config={{
                            type: 'text',
                            value: this.props.value,
                            onChange: this.props.onChange,
                            fieldType: 'number',
                        }}
                    >
                        {this.props.value}
                    </EditableProperty>
                );
            }
        } else {
            value = this.props.value;
        }

        const content = (
            <div
                className={`value-square ${this.props.className ?? ''}`}
                style={{ background: this.props.color ?? Theme.NOTICE, ...this.props.style }}
            >
                {this.generateHeader()}
                <div className="conts">
                    {value}
                </div>
                {
                    this.props.link
                        ? (
                            <Link to={this.props.link}>
                                <FontAwesomeIcon className="link" icon={faExternalLinkAlt} />
                            </Link>
                        )
                        : undefined
                }
            </div>
        );

        return this.props.link
            ? (
                <Link to={this.props.link}>
                    {content}
                </Link>
            )
            : content;
    }

}

export const ValueSquare = withRouter(ValueSquareClass);
