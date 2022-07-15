import React, { createContext, useContext, useMemo, useState } from 'react';
import ReactFlow, {
	Background,
	Connection,
	Controls,
	Edge,
	MiniMap,
	Node,
	ReactFlowInstance,
	useEdgesState,
	useNodesState,
} from 'react-flow-renderer';
import { Theme } from '../../theme/Theme';
import {
	NotificationContextType,
	NotificationPropsType,
} from '../../context/NotificationContext';
import { withNotificationContext } from '../../components/WithNotificationContext';
import { UIUtilities } from '../../utilities/UIUtilities';
import { faQuestion, faRoute } from '@fortawesome/free-solid-svg-icons';
import styles from './AutomationEditor.module.scss';
import { v4 } from 'uuid';
import { GlobalState, NodeConfiguration } from './nodes/_types';
import FindUser from './nodes/FindUser';
import Email from './nodes/Email';
import FormSubmit from './nodes/FormSubmit';
import JSTransformer from './nodes/JSTransformer';
import StringFormat from './nodes/StringFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import FindUserDynamic from './nodes/FindUserDynamic';
import MarkdownFormat from './nodes/MarkdownFormat';
import CreateEvent from './nodes/CreateEvent';

// So the general idea:
//  * A node performs an action in a workflow - these can be grouped into a few categories
//     - Activator - something that triggers the workflow to _begin_ [ () => T ]
//     - Transformer - something that changes a piece of data [ (X) => Y ]
//         Within this there can technically be three types but for the start, only one will be implemented
//           - Expander: produces multiple pieces of data from one [ (X) => Y[] ]
//           - Reducer: produces one piece of data from many [ (X[]) => Y ]
//           - Transformer: produces one piece of data from one piece of data [ (X) => Y ]
//     - Terminator - something that ends the workflow
//         Some terminators can have 'status' information technically but idk if I would count it as a transformer
//          i.e. creating a record produces an ID as status info, emailing produces if it was sent a status info
//               status info may be used in UI feedback only? idk - come back to this
//  * To make things simple we might just use global state which contains details of all nodes
//  * Each node can define a set of inputs and outputs and these inputs and outputs can have a
//    schema. We should try and automatically match up these schemas on connect to make sure they are
//    compatible. This will be harder for Transformer nodes which can change depending on the inputs
//      This has the side effect that all nodes connected to a transformer need to be re-evaluated
//      when one changes to make sure the schemas still match.
//        When there is an error - what should happen? Autodisconnect or mark as red?
//     This is _HARD_ for the time being just going to say which ones link together
// Can nodes have multiple inputs? Need to come up with a way to position them?

// Activator:
// * form submit
// Transformer:
// * js transform
// Terminator:
// * email
// * create tag
// * create state
// * create ent state
// * create topic
// * create event

const GlobalContext = createContext<{
	update: (state: (old: GlobalState) => GlobalState) => void;
	state: GlobalState;
}>({
	update: () => undefined,
	state: {},
});
//
// const makeNode = (
//     title: string,
//     content: () => React.ReactNode,
//     inputHandle?: { name: string, schema: Record<string, any> },
//     outputHandle?: { name: string, schema: Record<string, any> },
// ):
//     React.FunctionComponent<NodeProps> & { inSchema?: Record<string, any>, outSchema?: Record<string, any> } => {
//     return Object.assign((props: PropsWithChildren<NodeProps>) => {
//         return <>
//             {inputHandle
//                 ? <Handle type='target' position={Position.Left} id={inputHandle.name} className={styles.handle}
//                           style={{background: Theme.RED_LIGHT}}/>
//                 : null
//             }
//             <div className={styles.node}>
//                 <div className={styles.title}>
//                     {title}
//                 </div>
//                 <div className={styles.body}>
//                     {content()}
//                 </div>
//             </div>
//             {outputHandle
//                 ? <Handle type='source' position={Position.Right} id={outputHandle.name} className={styles.handle}
//                           style={{background: Theme.BLUE_LIGHT}}/>
//                 : null
//             }
//         </>
//     }, {
//         inSchema: inputHandle?.schema,
//         outSchema: outputHandle?.schema,
//     });
// }
//
// const DebugNode = makeNode(
//     'Debug Node',
//     () => <span>Debugging is fun!</span>,
//     {
//         name: 'debug-in',
//         schema: {id: 'string'},
//     },
// );
//
// const Debug2Node: React.FunctionComponent<NodeProps> = ({data}) => {
//     return (<>
//         <Handle type='target' position={Position.Left} id="flow-in"/>
//         <div style={{width: '5pc', height: '5pc', background: 'aqua'}}/>
//     </>)
// }
//
// const OnFormNode = makeNode(
//     'Activate: Form Submission',
//     () => {
//         const [id] = useState(String(v4()));
//         const context = useContext(GlobalContext);
//
//         return (<Select
//             placeholder={'Form'}
//             name={'form'}
//             options={['Booking form', 'Request access change']}
//             onSelectListener={(v: string) => {
//                 context.update((o) => ({...o, [id]: {...(o[id] ?? {}), value: v}}));
//             }}
//             initialOption={context.state[id]?.value ?? ''}
//         />);
//     },
//     undefined,
//     {name: 'form-data', schema: {}},
// );
//
// const TransformNode = makeNode(
//     'Process: Transform Data',
//     () => {
//         return (<span>todo</span>);
//     },
//     {name: 'input-data', schema: {}}
// )

function validateConnection(
	connection: Connection,
	nodes: Node[],
	edges: Edge[],
	context?: NotificationContextType
):
	| {
			source: Node;
			target: Node;
			sourceHandle: string | null;
			targetHandle: string | null;
	  }
	| false {
	console.log('hi?', connection);
	// Must be a valid connection
	const source = connection.source;
	const target = connection.target;
	if (target === null || source === null) return false;

	// Can't have missing nodes
	const sourceNode = nodes.find((e) => e.id === source);
	const targetNode = nodes.find((e) => e.id === target);
	if (sourceNode === undefined || targetNode === undefined) return false;
	if (sourceNode.type === undefined || targetNode.type === undefined)
		return false;

	// Can't repeat a connection
	const lookup = edges.find(
		(e) =>
			(e.source === sourceNode.id && e.target === targetNode.id) ||
			(e.source === targetNode.id && e.target === sourceNode.id)
	);
	if (lookup) return false;

	// Connection type must be valid
	if (
		!Object.prototype.hasOwnProperty.call(
			VALID_CONNECTION_TYPES,
			sourceNode.type
		) ||
		!VALID_CONNECTION_TYPES[sourceNode.type].includes(targetNode.type)
	) {
		UIUtilities.tryShowNotification(
			context,
			"Can't make connection",
			"Those two nodes don't fit together! Check out the docs to see more information about producing automations. ",
			faRoute,
			Theme.CYAN,
			{
				name: 'Go to docs',
				link: '/docs/automations#connections',
			}
		);
		return false;
	}

	return {
		source: sourceNode,
		target: targetNode,
		sourceHandle: connection.sourceHandle,
		targetHandle: connection.targetHandle,
	};
}

const NODE_TYPES: NodeConfiguration<any>[] = [
	FormSubmit,
	JSTransformer,
	Email,
	FindUser,
	StringFormat,
	FindUserDynamic,
	MarkdownFormat,
	CreateEvent,
];

const VALID_CONNECTION_TYPES = ((c: Record<string, string[]>) => {
	Object.keys(c).forEach((key) => {
		c[key].forEach((v) => {
			if (Object.prototype.hasOwnProperty.call(c, v)) {
				if (!c[v].includes(key)) c[v].push(key);
			} else {
				c[v] = [key];
			}
		});
	});

	return c;
})({
	[FormSubmit.id]: [
		JSTransformer.id,
		StringFormat.id,
		MarkdownFormat.id,
		CreateEvent.id,
	],
	[JSTransformer.id]: [
		Email.id,
		StringFormat.id,
		FindUserDynamic.id,
		MarkdownFormat.id,
		CreateEvent.id,
	],
	[Email.id]: [],
	[FindUser.id]: [
		Email.id,
		JSTransformer.id,
		StringFormat.id,
		MarkdownFormat.id,
	],
	[StringFormat.id]: [JSTransformer.id, Email.id, FindUserDynamic.id],
	[FindUserDynamic.id]: [
		Email.id,
		StringFormat.id,
		JSTransformer.id,
		MarkdownFormat.id,
	],
	[MarkdownFormat.id]: [JSTransformer.id, Email.id, FindUserDynamic.id],
	[CreateEvent.id]: [],
});

const AutomationEditor: React.FunctionComponent<NotificationPropsType> = (
	props
) => {
	const [reactFlowInstance, setReactFlowInstance] =
		useState<null | ReactFlowInstance>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState([
		// {id: 'node-1', type: FormSubmit.id, position: {x: 0, y: 0}, data: {value: 'Booking form'}},
		// {id: 'node-2', type: JSTransformer.id, position: {x: 200, y: 100}, data: {}},
		// {id: 'node-3', type: Email.id, position: {x: 400, y: 50}, data: {}},
		// {id: 'node-4', type: FindUser.id, position: {x: 700, y: 50}, data: {}},
	]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const options = {
		animated: true,
	};

	const remove = (nodeID: string) =>
		setNodes((n) => n.filter((e) => e.id !== nodeID));

	const nodeTypes = useMemo(
		() =>
			Object.fromEntries(
				NODE_TYPES.map((e) => [
					e.id,
					(props: any) => {
						const globalState = useContext(GlobalContext);
						const { Component } = e;
						return (
							<Component
								self={e}
								update={(key: string, value: any) => {
									globalState.update((old) => ({
										...old,
										[key]: value,
									}));
								}}
								{...globalState.state}
								onRemove={() => {
									remove(props.id);
								}}
								id={props.id}
							/>
						);
					},
				])
			),
		[]
	);

	const [state, setState] = useState<GlobalState>({});

	const buttonOptions = NODE_TYPES.map((node) => (
		<button
			className={styles.card}
			onClick={() =>
				setNodes((p) => [
					...p,
					{
						id: `${node.id}-${v4()}`,
						type: node.id,
						position: { x: 0, y: 0 },
						data: {},
					},
				])
			}
			key={`add.${node.id}`}
		>
			{/*Weird typing here because the type is too complex*/}
			<FontAwesomeIcon icon={((node.icon as any) ?? faQuestion) as IconProp} />
			<strong>{node.title}</strong>
			{node.description ? <span>{node.description}</span> : null}
		</button>
	));

	return (
		<div style={{ width: '100%', flexGrow: '1' }} className={styles.editor}>
			<div className={styles.left}>{buttonOptions}</div>
			<div className={styles.right}>
				<button
					onClick={() =>
						console.log(
							reactFlowInstance?.toObject(),
							state,
							JSON.stringify(reactFlowInstance?.toObject()),
							JSON.stringify(state)
						)
					}
				>
					Save
				</button>
				<GlobalContext.Provider
					value={{
						state,
						update: (executor) => setState(executor(state)),
					}}
				>
					<ReactFlow
						nodeTypes={nodeTypes}
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onInit={setReactFlowInstance}
						onConnect={(a) => {
							const connection = validateConnection(
								a,
								nodes,
								edges,
								props.notificationContext
							);

							if (!connection) return;

							setEdges((e) => [
								...e,
								{
									type: 'default',
									source: connection.source.id,
									target: connection.target.id,
									sourceHandle: connection.sourceHandle,
									targetHandle: connection.targetHandle,
									animated: true,
									id: `e${Math.random()}`,
									label: '',
								},
							]);
						}}
						fitView
						defaultEdgeOptions={options}
					>
						<Background />
						<MiniMap />
						<Controls />
					</ReactFlow>
				</GlobalContext.Provider>
			</div>
		</div>
	);
};

export default withNotificationContext(AutomationEditor);
