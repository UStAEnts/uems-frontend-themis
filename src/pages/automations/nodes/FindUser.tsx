import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AutomationException from '../execution/AutomationException';
import apiInstance from '../../../utilities/APIPackageGen';

const FindUser: GPSConfig = {
	id: 'find-user',
	title: 'Source: Find User by Username',
	inputs: {},
	outputs: {
		'user-object': { display: 'Full User', schema: zod.any() },
		'email-address': { display: 'Email', schema: zod.any() },
	},
	Component: (props) => {
		// TODO: real types
		const selected = props[props.id]?.user ?? undefined;

		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<TextField
					name={'Username'}
					onChange={(v: string) => props.update(props.id, { user: v })}
					initialContent={selected}
					type="text"
				/>
			</DefaultConfigNode>
		);
	},
	icon: faUser,
	description:
		'Looks up a single, fixed user and returns their properties if one is found. This is not dynamic, if' +
		'you need to look up a user from an input, see "Transform: Find User by Username"',
};

export const requiredKeys = undefined;

export async function findUserExecutor(
	configuration: {},
	state: { username: string }
) {
	apiInstance
		.user()
		.id(state.username)
		.get()
		.then((d) => {
			if (d.status === 'FAILED')
				throw new AutomationException(
					`Failed to locate user! There was a server side error: ${d.error}`
				);

			return { full_user: d.result, email: d.result.email };
		})
		.catch((e) => {
			throw new AutomationException(
				'Failed to locate user! An unknown error occurred!',
				e
			);
		});
}

export default FindUser;
