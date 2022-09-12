export default class AutomationException extends Error {
	private _throwable: Error | undefined;

	constructor(message: string, throwable?: Error) {
		super(message);
		this._throwable = throwable;
	}

	get throwable(): Error | undefined {
		return this._throwable;
	}
}
