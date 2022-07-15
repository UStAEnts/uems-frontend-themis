import * as zod from 'zod';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { Select } from '../../../components/atoms/select/Select';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faFileContract } from '@fortawesome/free-solid-svg-icons';

const FormSubmit: GPSConfig = {
	id: 'form-submit',
	title: 'Activate: Form Submission',
	inputs: {},
	outputs: {
		a: { schema: zod.any() },
	},
	Component: (props) => {
		// TODO: real types
		const [forms, setForms] = useState<{ id: string; name: string }[]>();
		const [loading, setLoading] = useState<
			'pre' | 'loading' | 'loaded' | Error
		>('pre');

		const selected = props[props.id]?.formID ?? undefined;

		useEffect(() => {
			if (loading !== 'pre') return;
			setLoading('loading');

			setTimeout(() => {
				// TODO: add a form loader when the backend is there
				setForms([
					{ id: 'a', name: 'Booking Form' },
					{ id: 'b', name: 'Venue Report' },
				]);
				setLoading('loaded');
			}, 1000);
		}, [loading]);

		const options = forms?.map((a) => ({ value: a.id, text: a.name })) ?? [];
		const initial =
			loading !== 'loaded'
				? 'Loading...'
				: options.find((e) => e.value === selected);

		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<Select
					placeholder={'Form'}
					name={'form'}
					options={loading !== 'loaded' ? ['Loading...'] : (options as any)}
					disabled={loading !== 'loaded'}
					initialOption={initial}
					onSelectListener={(v: any) =>
						props.update(props.id, {
							formID: typeof v === 'string' ? v : v.value,
						})
					}
				/>
			</DefaultConfigNode>
		);
	},
	icon: faFileContract,
	description:
		'Launch this automation when a form is submitted, this will output the data submitted as part of that' +
		'form',
};

export default FormSubmit;
