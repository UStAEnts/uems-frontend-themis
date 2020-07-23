import { cleanup } from '@testing-library/react';
import { v4 } from 'uuid';
import { EntsStateResponse, EventResponse, StateResponse } from '../utilities/APITypes';

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
    actions: Function,
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

export async function cleanDOMTest(action: () => void) {
    await action();
    return cleanup();
}

export const makeEvent = (
    name: string,
    start: number,
    hourDuration: number,
    attendance?: number,
    venue?: string,
    id?: string,
    state?: StateResponse,
    ents?: EntsStateResponse,
) => ({
    name,
    id: id ?? v4(),
    startDate: start,
    endDate: start + (hourDuration * 60 * 60 * 1000),
    attendance: attendance ?? 0,
    venue: venue ?? 'venue',
    state,
    ents,
} as EventResponse);
