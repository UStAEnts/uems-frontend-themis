import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faEnvelope, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import apiInstance, { POSTEventsBody } from '../../../utilities/APIPackageGen';
import AutomationException from '../execution/AutomationException';

const CreateEvent: GPSConfig = {
	id: 'create-event',
	title: 'Terminate: Create Event',
	inputs: {
		data: { schema: zod.string() },
	},
	outputs: {},
	Component: (props) => {
		return (
			<DefaultConfigNode onRemove={props.onRemove} {...props.self}>
				<span>
					This will generate a new event in the system. To see which parameters
					are required in the input node,{' '}
					<a href={'/docs/automation/create-event'}>
						check out the documentation
					</a>
				</span>
			</DefaultConfigNode>
		);
	},
	icon: faTicketAlt,
	description: 'Creates an event in the system with the provided properties.',
};

const InputValidator = zod.object({
	name: zod.string(),
	venue: zod.string(),
	start: zod.number(),
	end: zod.number(),
	attendance: zod.number(),
	state: zod.string().optional(),
	ents: zod.string().optional(),
});

export const requiredKeys = 'single';

export async function createEventExecutor(configuration: any, state: {}) {
	const parse = InputValidator.safeParse(configuration);
	if (!parse.success) {
		throw new AutomationException(
			"Invalid data passed to 'Terminate: Create Event' node"
		);
	}

	const submission: POSTEventsBody = parse.data;
	return apiInstance
		.events()
		.post(submission)
		.then((d) => {
			if (d.status === 'FAILED')
				throw new AutomationException(
					`Failed to create a new event! There was a server side error: ${d.error}`
				);

			return { id: d.result[0] };
		})
		.catch((e) => {
			throw new AutomationException(
				'Failed to create a new event! An unknown error occurred!',
				e
			);
		});
}

export default CreateEvent;
