export function get<T,
    P1 extends keyof T>(obj: T, prop1: P1): T[P1] | undefined;

export function get<T,
    P1 extends keyof T,
    P2 extends keyof T[P1]>(obj: T, prop1: P1, prop2: P2): T[P1][P2] | undefined;

export function get<T,
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]>(obj: T, prop1: P1, prop2: P2, prop3: P3): T[P1][P2][P3] | undefined;

// ...and so on...

export function get(obj: any, ...props: string[]): any {
    return obj && props.reduce(
        (result, prop) => (result === undefined || result === null ? undefined : result[prop]),
        obj,
    );
}

export function failEarlySet<T,
    P1 extends keyof T>(obj: T, prop1: P1): (value: T[P1]) => boolean;

export function failEarlySet<T,
    P1 extends keyof T,
    P2 extends keyof T[P1]>(obj: T, prop1: P1, props2: P2): (value: T[P1][P2]) => boolean;

export function failEarlySet<T,
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]>(obj: T, prop1: P1, props2: P2, props3: P3): (value: T[P1][P2][P3]) => boolean;

export function failEarlySet(obj: any, ...props: string[]) {
    if (!obj) return () => false;
    return (value: unknown) => {
        let active = obj;

        for (const prop of props.slice(0, props.length - 1)) {
            if (active === undefined || active === null) return false;

            try {
                active = active[prop];
            } catch (e) {
                return false;
            }
        }

        active[props[props.length - 1]] = value;
        return true;
    };
}

type SetStateType<T> = ((old: T) => T);

export function failEarlyStateSet<T,
    P1 extends keyof T>(
    state: T,
    setState: (set: SetStateType<T>) => any,
    prop1: P1,
): (value: T[P1]) => void;

export function failEarlyStateSet<T,
    P1 extends keyof T,
    P2 extends keyof T[P1]>(
    state: T,
    setState: (set: SetStateType<T>) => any,
    prop1: P1,
    props2: P2
): (value: T[P1][P2]) => void;

export function failEarlyStateSet<T,
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]>(
    state: T,
    setState: (set: SetStateType<T>) => any,
    prop1: P1,
    props2: P2,
    props3: P3,
): (value: T[P1][P2][P3]) => void;

export function failEarlyStateSet(obj: any, setState: (set: SetStateType<any>) => any, ...props: string[]) {
    if (!setState.name.startsWith('bound ')) {
        console.warn('failEarlyStateSet: setState does not begin with "bound", if you have called it '
            + 'directly with this.setState this will fail. You must call it with this.setState.bind(this) or it will'
            + 'not be able to update your component. This warning may be a false raise but double check');
        console.trace('Stack trace to failEarlyStateSet');
    }
    return (value: any) => {
        setState((old: any) => {
            const clone = { ...old };
            let entry: any = clone;

            // eslint-disable-next-line prefer-const
            let [target, ...steps] = [...props].reverse();
            steps = steps.reverse();

            for (const step of steps) {
                if (entry === null || entry === undefined) {
                    throw new Error(`invalid keys: ${steps.join('.')}=>${target}`);
                }
                entry = entry[step];
            }

            entry[target] = value;
            console.log(clone, entry, target, value, steps);

            return clone;
        });
    };
}
