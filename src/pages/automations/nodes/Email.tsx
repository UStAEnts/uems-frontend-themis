import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

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

export default Email;
