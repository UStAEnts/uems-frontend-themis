import { v4 } from 'uuid';

export default function sandbox(
	code: string,
	variables: Record<string, any>,
	functions: Record<string, Function>
) {
	const uniqueID = v4();
	const iframe = `
		<script>
			const callbacks = {};
			
			window.addEventListener('message', function (e) {
				if(!e.data) return;
				if(e.data.code !== "${uniqueID}") return;
				if(e.data.requestID && callbacks[e.data.requestID]) callbacks[e.data.requestID](e.data.result);
			});
			
			${Object.entries(variables)
				.map(([key, value]) => `const ${key}=${JSON.stringify(value)};`)
				.join('\n\n')}
			
			${Object.keys(functions)
				.map(
					(name) =>
						`function ${name}(...args){ 
									const id = String(Math.floor(Math.random() * 10000));
									return new Promise((resolve) => {
										callbacks[id] = resolve;
										window.parent.postMessage({
											action: 'execute',
											requestID: id,
											func: "${name}",
											args,
											code: "${uniqueID}",
										}, '*');
									});
								 }`
				)
				.join('\n\n')}
			
			(async () => {
				const result = await ((async () => {
					${code}
				})());
				
				window.parent.postMessage({
					action: 'resolve',
					code: "${uniqueID}",
					result,
				}, '*');
			})();</script>`;

	console.log(iframe);
	return new Promise((resolve, reject) => {
		const handler = async (msg: MessageEvent) => {
			if (!msg.data) return;
			if (msg.data.code !== uniqueID) return;
			if (!msg.source) return;

			if (msg.data.action === 'log') console.log(msg.data);

			if (msg.data.action === 'execute') {
				if (!msg.data.func) return;
				if (!msg.data.requestID) return;
				if (msg.data.args === undefined) return;

				// @ts-ignore
				msg.source.postMessage(
					{
						code: uniqueID,
						requestID: msg.data.requestID,
						result: await functions[msg.data.func](...msg.data.args),
					},
					'*'
				);
			}

			if (msg.data.action === 'resolve') {
				if (!msg.data.result) return;
				realFrame.remove();
				window.removeEventListener('message', handler);
				resolve(msg.data.result);
			}
		};

		setTimeout(() => {
			window.removeEventListener('message', handler);
			realFrame.remove();
			reject(new Error('timed out'));
		}, 10000);

		window.addEventListener('message', handler);

		const realFrame = document.createElement('iframe');
		realFrame.setAttribute('sandbox', 'allow-scripts');
		document.body.append(realFrame);
		realFrame.srcdoc = iframe;
		realFrame.contentWindow?.postMessage({ ping: true }, '*');
	});
}
