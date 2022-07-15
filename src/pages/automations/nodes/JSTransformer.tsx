import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faCode } from '@fortawesome/free-solid-svg-icons';

const JSTransformer: GPSConfig = {
	id: 'js-transformer',
	title: 'Transform: JS Code',
	inputs: {
		a: { schema: zod.any() },
	},
	outputs: {
		'raw-output': { schema: zod.any() },
	},
	Component: (props) => {
		const content = props[props.id]?.code;

		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<TextField
					name={'code'}
					type="textarea"
					style={{ fontFamily: 'monospace' }}
					initialContent={content}
					onChange={(v) => props.update(props.id, { code: v })}
				/>
			</DefaultConfigNode>
		);
	},
	icon: faCode,
	description:
		'Run some custom JavaScript code against the input object to transform it into another format',
};

export default JSTransformer;
