import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const FindUserDynamic: GPSConfig = {
	id: 'find-user-dynamic',
	title: 'Transform: Find User by Username',
	inputs: {
		username: { display: 'Username', schema: zod.string() },
	},
	outputs: {
		'user-object': { display: 'Full User', schema: zod.any() },
		'email-address': { display: 'Email', schema: zod.any() },
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

export default FindUserDynamic;
