import { StoredAutomation } from '../serialisation';
import AutomationException from './AutomationException';

import CreateEvent, {
	createEventExecutor,
	requiredKeys as createEventRequired,
} from '../nodes/CreateEvent';
import Email, {
	emailExecutor,
	requiredKeys as emailRequired,
} from '../nodes/Email';
import FindUser, {
	findUserExecutor,
	requiredKeys as findUserRequired,
} from '../nodes/FindUser';
import FindUserDynamic, {
	findUserDynamicExecutor,
	requiredKeys as findUserDynamicRequired,
} from '../nodes/FindUserDynamic';
import JSTransformer, {
	jsTransformerExecutor,
	requiredKeys as jsTransformerRequired,
} from '../nodes/JSTransformer';
import MarkdownFormat, {
	markdownFormatExecutor,
	requiredKeys as markdownFormatRequired,
} from '../nodes/MarkdownFormat';
import StringFormat, {
	requiredKeys as stringFormatRequired,
	stringFormatExecutor,
} from '../nodes/StringFormat';
import FormSubmit from '../nodes/FormSubmit';

let SINGLE_RUN_DONE = false;

const pending: Record<
	string,
	{
		nodeType?: string;
		requiredKeys: string[] | 'single' | undefined;
		definedKeys: Record<string, any> | any;
	}
> = {};

function getGPSConfig(nodeType?: string) {
	switch (nodeType) {
		case 'create-event':
			return CreateEvent;
		case 'email':
			return Email;
		case 'find-user':
			return FindUser;
		case 'find-user-dynamic':
			return FindUserDynamic;
		case 'js-transformer':
			return JSTransformer;
		case 'markdown-format':
			return MarkdownFormat;
		case 'string-format':
			return StringFormat;
		case 'form-submit':
			return FormSubmit;
	}
	return null;
}

function getRequired(nodeType?: string) {
	switch (nodeType) {
		case 'create-event':
			return createEventRequired;
		case 'email':
			return emailRequired;
		case 'find-user':
			return findUserRequired;
		case 'find-user-dynamic':
			return findUserDynamicRequired;
		case 'js-transformer':
			return jsTransformerRequired;
		case 'markdown-format':
			return markdownFormatRequired;
		case 'string-format':
			return stringFormatRequired;
		default:
			return 'single';
	}
}

function getExecutor(nodeType?: string) {
	switch (nodeType) {
		case 'create-event':
			return createEventExecutor;
		case 'email':
			return emailExecutor;
		case 'find-user':
			return findUserExecutor;
		case 'find-user-dynamic':
			return findUserDynamicExecutor;
		case 'js-transformer':
			return jsTransformerExecutor;
		case 'markdown-format':
			return markdownFormatExecutor;
		case 'string-format':
			return stringFormatExecutor;
		case 'form-submit':
			return () => ({});
	}
	return null;
}

export default async function execute(config: StoredAutomation) {
	if (SINGLE_RUN_DONE) return;
	const result = config.nodes
		.map((node) => [
			node,
			config.edges.filter((e) => e.target === node.id).length,
		])
		.find(([_, count]) => count === 0) as [typeof config.nodes[number], number];
	if (result === undefined)
		throw new AutomationException('Failed to find origin node');

	const [node] = result;
	pending[node.id] = {
		nodeType: node.type,
		definedKeys: {},
		requiredKeys: getRequired(node.type),
	};

	console.log('starting with', node);

	let actionPerformed = false;
	while (Object.keys(pending).length > 0) {
		actionPerformed = false;
		console.log('beginning run with state', pending);
		const find = Object.entries(pending).find(([key, cfg]) => {
			if (typeof cfg.requiredKeys === 'undefined') {
				console.log('required keys = undefined, scheduling');
				return true;
			} else if (typeof cfg.requiredKeys === 'string') {
				if (cfg.definedKeys) {
					console.log('defined keys = defined, scheduling');
					return true;
				}
				console.log('defined keys = undefined, skipping');
			} else {
				if (
					cfg.requiredKeys.filter(
						(e) => !Object.prototype.hasOwnProperty.call(cfg.definedKeys, e)
					).length === 0
				) {
					console.log('required + defined intersect, scheduling');
					return true;
				}

				console.log('required + defined not matching, skipping');
			}

			return false;
		});

		if (find) {
			console.log(
				'record found, executing',
				find[0],
				'with data',
				find[1].definedKeys
			);
			await run(config, pending, find[0], find[1].definedKeys);
			delete pending[find[0]];
			actionPerformed = true;
		}

		if (!actionPerformed)
			throw new AutomationException('No action performed in step');
	}

	console.log('Execution completed successfully!');

	SINGLE_RUN_DONE = true;
}

async function run(
	config: StoredAutomation,
	activeSet: typeof pending,
	nodeID: string,
	data: any
) {
	const nodeThis = config.nodes.find((e) => e.id === nodeID);
	if (nodeThis === undefined)
		throw new AutomationException('Failed to execute, unknown node');

	console.log('[run] located', nodeThis);
	console.log('[run] trying to find executor for', nodeThis.type);

	const state = config.state[nodeID];
	const executor = getExecutor(nodeThis.type);
	if (executor === null)
		throw new AutomationException('Failed to execute, executor was null');

	console.log('[run] found', state, executor);

	let result = await executor(data, state);

	console.log('[run] got result', result);

	console.log('[run:summary] #', data, state, ` ---> ${nodeID} ---> `, result);

	// Now find all the targets
	config.edges
		.filter((e) => e.source === nodeID)
		.forEach((node) => {
			console.log('[run] found target', node.target);

			const targetNode = config.nodes.find((e) => e.id === node.target);
			if (!targetNode) throw new AutomationException('Invalid target');
			const required = getRequired(targetNode.type);

			const gps = getGPSConfig(nodeThis.type);
			if (!gps)
				throw new AutomationException('No GPS for node type ' + nodeThis.type);

			if (Object.keys(gps.outputs).length > 1 && node.sourceHandle) {
				console.log('extracting key', node.sourceHandle, 'from', result);
				result = (result as any)[node.sourceHandle as string];
			}
			// if (nodeThis.)

			if (Object.prototype.hasOwnProperty.call(activeSet, node.target)) {
				let defined;
				if (typeof activeSet[node.target].requiredKeys === 'undefined')
					defined = undefined;
				else if (typeof activeSet[node.target].requiredKeys === 'string')
					defined = result;
				else
					defined = {
						...activeSet[node.target].definedKeys,
						[node.targetHandle as string]: result,
					};

				console.log('[run] updating existing keys');
				activeSet[node.target].definedKeys = defined;
			} else {
				let defined;
				if (typeof required === 'undefined') defined = undefined;
				else if (typeof required === 'string') defined = result;
				else defined = { [node.targetHandle as string]: result };

				console.log('[run] setting up new keys', targetNode, defined, required);

				activeSet[targetNode.id] = {
					nodeType: targetNode.type,
					definedKeys: defined,
					requiredKeys: required,
				};
			}
		});
}

export const debuggingThisShit = execute({
	nodes: [
		{
			width: 175,
			height: 96,
			id: 'form-submit-58ac094c-3656-4b19-bcdb-011b06b57083',
			type: 'form-submit',
			position: { x: -221.5, y: -48 },
			data: {},
			selected: false,
			positionAbsolute: { x: -221.5, y: -48 },
			dragging: false,
		},
		{
			width: 168,
			height: 105,
			id: 'string-format-8027d940-ec5f-4b17-8b3d-47f86873c5cc',
			type: 'string-format',
			position: { x: 39.05295235994424, y: 17.75134198179284 },
			data: {},
			selected: false,
			positionAbsolute: { x: 39.05295235994424, y: 17.75134198179284 },
			dragging: false,
		},
		{
			width: 168,
			height: 105,
			id: 'string-format-cb4d8ffc-651a-4e13-97e5-ea32eecfb43a',
			type: 'string-format',
			position: { x: 32.66246924649886, y: -116.44880340056105 },
			data: {},
			selected: false,
			positionAbsolute: { x: 32.66246924649886, y: -116.44880340056105 },
			dragging: false,
		},
		{
			width: 181,
			height: 113,
			id: 'markdown-format-80a31c97-9456-401f-8e0c-8b97781e149e',
			type: 'markdown-format',
			position: { x: 29.112200850140255, y: 147.69116528851646 },
			data: {},
			selected: false,
			positionAbsolute: { x: 29.112200850140255, y: 147.69116528851646 },
			dragging: false,
		},
		{
			width: 146,
			height: 104,
			id: 'js-transformer-351137a1-e7c6-4ad5-ba61-55756236d8ed',
			type: 'js-transformer',
			position: { x: 41.89316707703108, y: 273.3706665196098 },
			data: {},
			selected: false,
			positionAbsolute: { x: 41.89316707703108, y: 273.3706665196098 },
			dragging: false,
		},
		{
			width: 219,
			height: 52,
			id: 'find-user-dynamic-17d02cd3-4a16-45d6-84f8-51a44b968c35',
			type: 'find-user-dynamic',
			position: { x: 315.26383359664084, y: -64.61488481372595 },
			data: {},
			selected: false,
			positionAbsolute: { x: 315.26383359664084, y: -64.61488481372595 },
			dragging: false,
		},
		{
			width: 187,
			height: 76,
			id: 'email-9a330514-99d9-46b1-9568-4cdef37ea726',
			type: 'email',
			position: { x: 646.1488481372596, y: 173.25309774229817 },
			data: {},
			selected: true,
			positionAbsolute: { x: 646.1488481372596, y: 173.25309774229817 },
			dragging: false,
		},
		{
			width: 242,
			height: 78,
			id: 'create-event-31b72134-e777-433b-bba4-a492bc255a2d',
			type: 'create-event',
			position: { x: 498.457682848743, y: 276.92093491596836 },
			data: {},
			selected: false,
			positionAbsolute: { x: 498.457682848743, y: 276.92093491596836 },
			dragging: false,
		},
	],
	edges: [
		{
			animated: true,
			type: 'default',
			source: 'form-submit-58ac094c-3656-4b19-bcdb-011b06b57083',
			target: 'string-format-cb4d8ffc-651a-4e13-97e5-ea32eecfb43a',
			sourceHandle: 'a',
			targetHandle: 'raw-data',
			id: 'e0.7984356767021668',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'form-submit-58ac094c-3656-4b19-bcdb-011b06b57083',
			target: 'string-format-8027d940-ec5f-4b17-8b3d-47f86873c5cc',
			sourceHandle: 'a',
			targetHandle: 'raw-data',
			id: 'e0.8460329175892234',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'form-submit-58ac094c-3656-4b19-bcdb-011b06b57083',
			target: 'markdown-format-80a31c97-9456-401f-8e0c-8b97781e149e',
			sourceHandle: 'a',
			targetHandle: 'raw-data',
			id: 'e0.5526554107364325',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'form-submit-58ac094c-3656-4b19-bcdb-011b06b57083',
			target: 'js-transformer-351137a1-e7c6-4ad5-ba61-55756236d8ed',
			sourceHandle: 'a',
			targetHandle: 'a',
			id: 'e0.9951520763228081',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'string-format-cb4d8ffc-651a-4e13-97e5-ea32eecfb43a',
			target: 'find-user-dynamic-17d02cd3-4a16-45d6-84f8-51a44b968c35',
			sourceHandle: 'formatted',
			targetHandle: 'username',
			id: 'e0.9439604888316815',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'string-format-8027d940-ec5f-4b17-8b3d-47f86873c5cc',
			target: 'email-9a330514-99d9-46b1-9568-4cdef37ea726',
			sourceHandle: 'formatted',
			targetHandle: 'subject',
			id: 'e0.7343499309416806',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'markdown-format-80a31c97-9456-401f-8e0c-8b97781e149e',
			target: 'email-9a330514-99d9-46b1-9568-4cdef37ea726',
			sourceHandle: 'formatted',
			targetHandle: 'body',
			id: 'e0.7480887127378999',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'js-transformer-351137a1-e7c6-4ad5-ba61-55756236d8ed',
			target: 'create-event-31b72134-e777-433b-bba4-a492bc255a2d',
			sourceHandle: 'raw-output',
			targetHandle: 'data',
			id: 'e0.9124566232388054',
			label: '',
		},
		{
			animated: true,
			type: 'default',
			source: 'find-user-dynamic-17d02cd3-4a16-45d6-84f8-51a44b968c35',
			target: 'email-9a330514-99d9-46b1-9568-4cdef37ea726',
			sourceHandle: 'email',
			targetHandle: 'email',
			id: 'e0.15668946413026652',
			label: '',
		},
	],
	state: {
		'string-format-cb4d8ffc-651a-4e13-97e5-ea32eecfb43a': { format: 'debug' },
		'string-format-8027d940-ec5f-4b17-8b3d-47f86873c5cc': {
			format:
				'Your booking has been submitted $.detail.start|format("YYYY-MM-dd HH:mm:ss")',
		},
		'markdown-format-80a31c97-9456-401f-8e0c-8b97781e149e': {
			format: 'Thanks for you submission! $.detail.name',
		},
		'js-transformer-351137a1-e7c6-4ad5-ba61-55756236d8ed': {
			code: 'return {name: "some name", start: 0, end: 0, attendance: 0, venue: "venue"};',
		},
	},
	_meta: { editorVersion: 0 },
	viewport: {
		x: 512.0691982270234,
		y: 125.49767014334451,
		zoom: 0.8891729383652917,
	},
});
