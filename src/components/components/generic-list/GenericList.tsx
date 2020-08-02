import React, { CSSProperties } from 'react';
import { Link, withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { v4 } from 'uuid';
import './GenericList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconBox } from "../../atoms/icon-box/IconBox";
import { Theme } from "../../../theme/Theme";

export type GenericRecord<T> = {
    value: T,
    target?: string,
    tooltip?: string,
    identifier?: string,
}

export type GenericListPropsType<T> = {
    records: GenericRecord<T>[],
    render: (value: T) => React.ReactNode,
    dontPad?: boolean,
};

export type GenericListStateType = {
    identifiers: string[],
};

class GenericListClass<T> extends React.Component<GenericListPropsType<T>, GenericListStateType> {

    static displayName = 'GenericList';

    constructor(props: Readonly<GenericListPropsType<T>>) {
        super(props);

        const identifiers = [];

        for (const element of props.records) {
            if (element.identifier) {
                identifiers.push(element.identifier);
            } else {
                identifiers.push(v4());
            }
        }

        this.state = {
            identifiers,
        };
    }

    private renderElement = (element: GenericRecord<T>, index: number) => {
        let reactElement;

        if (element.tooltip) {
            reactElement = (
                <div>
                    <ReactTooltip
                        place="bottom"
                        type="dark"
                        effect="float"
                        id={`ewt-${this.state.identifiers[index]}`}
                    >
                        {element.tooltip}
                    </ReactTooltip>
                    <div id={`ewt-${this.state.identifiers[index]}`}>
                        {this.props.render(element.value)}
                    </div>
                </div>
            );
        } else {
            reactElement = this.props.render(element.value);
        }

        if (element.target) {
            return (
                <div className="entry" key={this.state.identifiers[index]}>
                    <Link to={element.target}>
                        {reactElement}
                    </Link>
                </div>
            );
        }

        return (
            <div className="entry" key={this.state.identifiers[index]}>
                {reactElement}
            </div>
        );
    }

    render() {
        return (
            <div className={`generic-list ${this.props.dontPad ? 'no-padding' : ''}`}>
                {this.props.records.map(this.renderElement)}
            </div>
        );
    }

}

export function genericRender<T extends Record<string, any>>(
    excluded?: (keyof T)[],
    customRenderers?: Record<(keyof T), ((value: any) => React.ReactNode)>,
    nameKey?: keyof T,
) {
    return (value: T) => {
        if (!Object.prototype.hasOwnProperty.call(value, 'name') && !nameKey) {
            console.error('Invalid setup, must either have a "name" property or provide "nameKey" value');
        }

        let name = nameKey ? value[nameKey] : (value.name ?? 'Unknown');
        let properties: React.ReactNode[] = [];

        for (const key of Object.keys(value) as (keyof T)[]) {
            // Skip excluded keys
            if (excluded && excluded.includes(key)) continue;
            // Use custom renderers where appropriate
            if (customRenderers && Object.prototype.hasOwnProperty.call(customRenderers, key)) {
                properties.push(customRenderers[key](value[key]));
                continue;
            }
            // Skip ID, colors and names as they will be handled differently
            if (key === 'name') continue;
            if (key === 'id') continue;
            if (key === 'color') continue;

            if (key === 'icon') continue;

            properties.push((
                <div className="property">
                    <div className="label">{key}</div>
                    <div className="value">{String(value[key])}</div>
                </div>
            ));
        }

        const id = (excluded && excluded.includes('id')) || !Object.prototype.hasOwnProperty.call(value, 'id')
            ? undefined
            : (
                <div className="id">{value['id' as (keyof T)]}</div>
            );

        const style: CSSProperties = {};

        if (Object.prototype.hasOwnProperty.call(value, 'color')) {
            style.borderBottom = `7px solid ${value['color' as keyof T]}`;
        }

        if (Object.prototype.hasOwnProperty.call(value, 'icon')) {
            return (
                <div className="generic-record with-icon" style={style}>
                    <div className="left">
                        <IconBox icon={value['icon' as keyof T]} color={value['color' as keyof T] ?? Theme.NOTICE} />
                    </div>
                    <div className="right">
                        <div className="name">{name}</div>
                        {properties}
                        {id}
                    </div>
                </div>
            );
        }

        return (
            <div className="generic-record" style={style}>
                <div className="name">{name}</div>
                {properties}
                {id}
            </div>
        );
    }
}

// @ts-ignore
export const GenericList: React.ComponentClass<GenericListPropsType,
    // @ts-ignore
    GenericListStateType> = withRouter(GenericListClass);
