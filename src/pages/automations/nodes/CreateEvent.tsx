import * as zod from 'zod';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { DefaultConfigNode, GPSConfig } from './_types';
import { faEnvelope, faTicketAlt } from '@fortawesome/free-solid-svg-icons';

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

export default CreateEvent;
