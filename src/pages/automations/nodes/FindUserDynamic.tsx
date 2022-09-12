import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AutomationException from '../execution/AutomationException';
import apiInstance from '../../../utilities/APIPackageGen';

const FindUserDynamic: GPSConfig = {
	id: 'find-user-dynamic',
	title: 'Transform: Find User by Username',
	inputs: {
		username: { display: 'Username', schema: zod.string() },
	},
	outputs: {
		full_user: { display: 'Full User', schema: zod.any() },
		email: { display: 'Email', schema: zod.any() },
	},
	Component: (props) => {
		return (
			<DefaultConfigNode
				onRemove={props.onRemove}
				{...props.self}
			></DefaultConfigNode>
		);
	},
	icon: faUser,
	description:
		'Looks up a user by username and returns their properties if one is found. This is dynamic, if' +
		'you need to look up a single fixed user (not from input), see "Source: Find User by Username"',
};

const InputValidator = zod.string();

export const requiredKeys = 'single';

export async function findUserDynamicExecutor(configuration: any, state: {}) {
	const parse = InputValidator.safeParse(configuration);
	if (!parse.success) {
		throw new AutomationException("Invalid data passed to 'Transform: ' node");
	}

	return apiInstance
		.user()
		.get({ username: parse.data })
		.then((d) => {
			if (d.status === 'FAILED')
				throw new AutomationException(
					`Failed to locate user! There was a server side error: ${d.error}`
				);

			if (d.result.length !== 1)
				throw new AutomationException(
					`Failed to locate user! Needed one result!`
				);

			return { full_user: d.result[0], email: d.result[0].email };
		})
		.catch((e) => {
			throw new AutomationException(
				'Failed to locate user! An unknown error occurred!',
				e
			);
		});
}

export default FindUserDynamic;
