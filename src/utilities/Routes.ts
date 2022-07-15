type GenericRoute<T extends Function> = string & {
	make: T;
	string: string;
};
type Route = GenericRoute<(...values: string[]) => string>;
type RouteOne = GenericRoute<(a: string) => string>;
type RouteTwo = GenericRoute<(a: string, b: string) => string>;

function make<T extends GenericRoute<any>>(router: string): T {
	const parts = router.split('/');
	const elements = parts.filter((e) => e.startsWith(':')).length;
	if (elements > 2) throw new Error('cannot parse');

	let makeMake = (args: string[]) => {
		let activeIndex = 0;
		let result = [];
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].startsWith(':')) {
				result.push(args[activeIndex]);
				activeIndex++;
			} else {
				result.push(parts[i]);
			}
		}
		return result.join('/');
	};

	// TODO: better types? 'as any' is baaaad
	if (elements === 0)
		return Object.assign(router, { make: () => router, string: router }) as any;
	if (elements === 1)
		return Object.assign(router, {
			make: (a: string) => makeMake([a]),
			string: router,
		}) as any;
	if (elements === 2)
		return Object.assign(router, {
			make: (a: string, b: string) => makeMake([a, b]),
			string: router,
		}) as any;
	throw new Error('failed');
}

export const OPS_PLANNING = make<Route>('/workflow/ops');
export const EVENT_VIEW = make<RouteOne>('/events/:id');
