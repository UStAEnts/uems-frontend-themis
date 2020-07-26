import { cleanup } from '@testing-library/react';
import { v4 } from 'uuid';
import { EntsStateResponse, EventResponse, StateResponse, VenueResponse } from '../utilities/APIGen';

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
    venue?: VenueResponse,
    id?: string,
    state?: StateResponse,
    ents?: EntsStateResponse,
) => ({
    name,
    id: id ?? v4(),
    startDate: start,
    endDate: start + (hourDuration * 60 * 60 * 1000),
    attendance: attendance ?? 0,
    venue: venue ?? randomVenue('vid'),
    state,
    ents,
} as EventResponse);

export const randomVenue = (name: string): VenueResponse => ({
    user: {
        name: 'name',
        username: 'username',
        id: 'userid',
    },
    id: v4(),
    capacity: 0,
    color: '#aeaeae',
    date: new Date().getTime() / 1000,
    name,
});

export const randomState = (name: string): StateResponse => ({
    id: v4(),
    color: '#aeaeae',
    icon: 'coffee',
    name,
});

export const randomEnts = (name: string): EntsStateResponse => ({
    id: v4(),
    color: '#eaeaea',
    icon: 'coffee',
    name,
});
