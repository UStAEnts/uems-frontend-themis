import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AutomationException from '../execution/AutomationException';
import apiInstance from '../../../utilities/APIPackageGen';

const Email: GPSConfig = {
	id: 'email',
	title: 'Terminate: Email',
	inputs: {
		email: { display: 'Address', schema: zod.string() },
		subject: { display: 'Subject', schema: zod.string() },
		body: { display: 'Body', schema: zod.string() },
	},
	outputs: {},
	Component: (props) => {
		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<p>This email will be sent on the next mail cycle</p>
			</DefaultConfigNode>
		);
	},
	icon: faEnvelope,
	description:
		'Sends an email to a given email address. Inputs: email address, subject, body.',
};

const InputValidator = zod.object({
	// TODO: where should this limit be set
	email: zod.string().email().or(zod.array(zod.string().email()).max(70)),
	subject: zod.string(),
	body: zod.string(),
});

export const requiredKeys = ['email', 'subject', 'body'];

export async function emailExecutor(configuration: any, state: {}) {
	const parse = InputValidator.safeParse(configuration);
	if (!parse.success) {
		throw new AutomationException(
			"Invalid data passed to 'Terminate: Email' node"
		);
	}

	// TODO: automation endpoint
	// apiInstance
	// 	.automation()
	// 	.email()
	// 	.post(parse.data)
	// 	.then((d) => {
	// 		if (d.status === 'FAILED')
	// 			throw new AutomationException(
	// 				`Failed to email! There was a server side error: ${d.error}`
	// 			);
	//
	// 		return { successful: d.result.sent, failed: d.result.failed };
	// 	})
	// 	.catch((e) => {
	// 		throw new AutomationException(
	// 			'Failed to email! An unknown error occurred!',
	// 			e
	// 		);
	// 	});
}

export default Email;
