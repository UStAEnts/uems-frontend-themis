export function promiseTimeout(func: Function, time: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            func();
            resolve();
        }, time);
    });
}

export function mockDocumentEvents(
    config: { [key: string]: Function },
    onRemove: Function | undefined,
    actions: Function
) {
    const oldAdd = document.addEventListener;
    const oldRemove = document.removeEventListener;

    document.addEventListener = (event: any, ...rest: any[]) => {
        if (event) {
            const callback = config[event];
            if (callback) callback(event, ...rest);
        }
    };
    // @ts-ignore
    document.removeEventListener = onRemove ?? (() => ({}));

    // Run the actions in the new context
    actions();

    document.addEventListener = oldAdd;
    document.removeEventListener = oldRemove;
}
