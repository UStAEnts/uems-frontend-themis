import React, { CSSProperties } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { v4 } from 'uuid';
import { IconBox } from '../../atoms/icon-box/IconBox';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { TextField } from '../../atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import InputUtilities from '../../../utilities/InputUtilities';
import './GenericList.scss';

export type GenericRecord<T> = {
	value: T;
	target?: string;
	tooltip?: string;
	identifier?: string;
};

export type GenericListPropsType<T> = {
	records: GenericRecord<T>[];
	render: (value: T) => React.ReactNode;
	dontPad?: boolean;
	onClick?: (value: T) => void;
	searchable?: (value: GenericRecord<T>) => (string | undefined)[];
};

export type GenericListStateType = {
	identifiers: string[];
	search?: string;
};

class GenericListClass<T> extends React.Component<
	GenericListPropsType<T>,
	GenericListStateType
> {
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
		let reactElement: React.ReactElement | React.ReactNode;

		if (element.tooltip) {
			reactElement = [
				<ReactTooltip
					place="bottom"
					type="dark"
					effect="float"
					id={`ewt-${this.state.identifiers[index]}`}
				>
					{element.tooltip}
				</ReactTooltip>,
				<div id={`ewt-${this.state.identifiers[index]}`}>
					{this.props.render(element.value)}
				</div>,
			];
		} else {
			reactElement = this.props.render(element.value);
		}

		if (reactElement && this.props.onClick) {
			const handle = () => {
				if (this.props.onClick) this.props.onClick(element.value);
			};

			reactElement = (
				<div
					onClick={handle}
					role="button"
					tabIndex={0}
					onKeyDown={InputUtilities.higherOrderPress(
						InputUtilities.SPACE,
						handle,
						this,
						element.value
					)}
				>
					{reactElement}
				</div>
			);
		} else {
			reactElement = <div>{reactElement}</div>;
		}

		if (element.target) {
			return (
				<div className="entry" key={this.state.identifiers[index]}>
					<Link to={element.target}>{reactElement}</Link>
				</div>
			);
		}

		return (
			<div className="entry" key={this.state.identifiers[index]}>
				{reactElement}
			</div>
		);
	};

	render() {
		let search;
		let { records } = this.props;

		if (this.props.searchable) {
			search = (
				<TextField
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'search'
					)}
					name="Search"
					initialContent={this.state.search}
				/>
			);
			records = UIUtilities.defaultSearch(
				this.state.search,
				this.props.records,
				this.props.searchable
			);
		}

		return (
			<div className={`generic-list ${this.props.dontPad ? 'no-padding' : ''}`}>
				{search}

				{records.map(this.renderElement)}
			</div>
		);
	}
}

export function genericRender<T extends Record<string, any>>(
	excluded?: (keyof T)[],
	customRenderers?: Record<keyof T, (value: any) => React.ReactNode>,
	nameKey?: keyof T
) {
	return (value: T) => {
		if (!Object.prototype.hasOwnProperty.call(value, 'name') && !nameKey) {
			console.error(
				'Invalid setup, must either have a "name" property or provide "nameKey" value'
			);
		}

		const name = nameKey ? value[nameKey] : value.name ?? 'Unknown';
		const properties: React.ReactNode[] = [];

		for (const key of Object.keys(value) as (keyof T)[]) {
			// Skip excluded keys
			if (excluded && excluded.includes(key)) continue;
			// Use custom renderers where appropriate
			if (
				customRenderers &&
				Object.prototype.hasOwnProperty.call(customRenderers, key)
			) {
				properties.push(customRenderers[key](value[key]));
				continue;
			}
			// Skip ID, colors and names as they will be handled differently
			if (key === 'name') continue;
			if (key === 'id') continue;
			if (key === 'color') continue;

			if (key === 'icon') continue;

			properties.push(
				<div className="property" key={`prop-${String(value[key])}-${v4()}`}>
					<div className="label">
						{UIUtilities.capitaliseFirst(key as string)}
					</div>
					<div className="value">{String(value[key])}</div>
				</div>
			);
		}

		const id =
			(excluded && excluded.includes('id')) ||
			!Object.prototype.hasOwnProperty.call(value, 'id') ? undefined : (
				<div className="id">{value['id' as keyof T]}</div>
			);

		const style: CSSProperties = {};

		if (Object.prototype.hasOwnProperty.call(value, 'color')) {
			style.borderBottom = `7px solid ${value['color' as keyof T]}`;
		}

		if (Object.prototype.hasOwnProperty.call(value, 'icon')) {
			return (
				<div className="generic-record with-icon" style={style}>
					<div className="left">
						<IconBox
							icon={value['icon' as keyof T]}
							color={value['color' as keyof T] ?? Theme.NOTICE}
						/>
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
	};
}

// @ts-ignore
export const GenericList: React.ComponentClass<
	GenericListPropsType<any>,
	// @ts-ignore
	GenericListStateType
> = GenericListClass;
