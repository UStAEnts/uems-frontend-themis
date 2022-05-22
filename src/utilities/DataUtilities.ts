import { FallibleReactStateType } from "../components/components/error-screen/FallibleReactComponent";

type SetStateType<T> = (old: T) => T;


export function loadAPIData<T extends FallibleReactStateType>(
    dataSources: {
        call: (...args: any[]) => Promise<any>,
        stateName: keyof T,
        params: any[],
    }[],
    setState: (func: SetStateType<T>) => void,
    onPartial?: () => void,
    typeHint?: T,
): void;
export function loadAPIData<T extends FallibleReactStateType,
    P1 extends keyof T>(
    dataSources: {
        call: (...args: any[]) => Promise<any>,
        stateName: P1,
        params: any[],
    }[],
    setState: (func: SetStateType<T>) => void,
    onPartial?: () => void,
    typeHint?: T,
): void;
export function loadAPIData<T extends FallibleReactStateType,
    P1 extends keyof T,
    P2 extends keyof T[P1]>(
    dataSources: {
        call: (...args: any[]) => Promise<any>,
        stateName: [P1, P2],
        params: any[],
    }[],
    setState: (func: SetStateType<T>) => void,
    onPartial?: () => void,
    typeHint?: T,
): void;

export function loadAPIData<T extends FallibleReactStateType>(
    dataSources: {
        call: (...args: any[]) => Promise<any>,
        stateName: keyof T | string[],
        params: any[],
    }[],
    setState: (func: SetStateType<T>) => void,
    onPartial?: () => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    typeHint?: T,
) {
    setState((old) => ({
        ...old,
        loading: true,
    }));

    const promises = [];

    for (const source of dataSources) {
        promises.push(new Promise((resolve, reject) => {
            source.call.call(undefined, source.params).then((data) => {
                if (Object.prototype.hasOwnProperty.call(data, 'status') && data.status === 'PARTIAL'){
                    if(onPartial) onPartial();
                }

                setState((old) => {
                    const n = {
                        ...old,
                    };

                    // @ts-ignore
                    n[source.stateName] = data.result;

                    return n;
                });

                resolve(data);
            }).catch(reject);
        }));
    }

    Promise.all(promises).then(() => {
        setState((old) => ({
            ...old,
            loading: false,
        }));
    }).catch((err) => {
        console.error('Failed to set state', err);
        setState((old) => ({
            ...old,
            error: `Failed to load some data on this page: ${err.message}`,
        }));
    });
}
