import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';

const MarkdownFormat: GPSConfig = {
	id: 'markdown-format',
	title: 'Transform: Markdown Format',
	inputs: {
		'raw-data': { schema: zod.any() },
	},
	outputs: {
		formatted: { schema: zod.any() },
	},
	Component: (props) => {
		// TODO: real types
		const selected = props[props.id]?.user ?? undefined;

		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<TextField
					name={'Format'}
					onChange={(v: string) => props.update(props.id, { user: v })}
					initialContent={selected}
					type="textarea"
				/>
				<small>
					Need help? Check out{' '}
					<a href="/docs/automation/string-format">the docs</a>
				</small>
			</DefaultConfigNode>
		);
	},
	icon: faDollarSign,
	description: 'Produce a string by substituting in values from another object',
};

export default MarkdownFormat;
