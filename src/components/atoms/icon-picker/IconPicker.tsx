import React from 'react';
import * as Icon from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	EntrySelector,
	EntrySelectorPropsType,
	OptionType,
} from './EntrySelector';

export class IconSelector extends React.Component<
	Omit<EntrySelectorPropsType, 'options' | 'render'>,
	{}
> {
	private readonly options: OptionType[] = [];

	constructor(
		props: Readonly<Omit<EntrySelectorPropsType, 'options' | 'render'>>
	) {
		super(props);

		const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

		const icons = Object.keys(Icon)
			.filter(
				(name) =>
					!(
						name.toLowerCase() === 'prefix' ||
						name.toLowerCase() === 'fastopwatch20' ||
						name.toLowerCase() === 'fas'
					)
			)
			.filter((entry) => entry in Icon);

		for (const icon of icons) {
			let identifierOutput = '';
			const rawName = String(icon);

			for (let i = 2; i < rawName.length; i++) {
				// it is upper case
				if (upper.includes(rawName.charAt(i))) {
					if (i === 2) {
						identifierOutput += rawName.charAt(i).toLowerCase();
					} else {
						identifierOutput += `-${rawName.charAt(i).toLowerCase()}`;
					}
				} else {
					identifierOutput += rawName.charAt(i);
				}
			}

			this.options.push({
				name: rawName,
				identifier: identifierOutput,
			});
		}
	}

	private renderIcon = (identifier: string) => (
		<FontAwesomeIcon
			icon={['fas', identifier] as unknown as Icon.IconDefinition}
		/>
	);

	render() {
		return (
			<EntrySelector
				options={this.options}
				render={this.renderIcon}
				onSelect={this.props.onSelect}
				value={this.props.value}
				displayType={this.props.displayType}
				searchable={this.props.searchable}
			/>
		);
	}
}
