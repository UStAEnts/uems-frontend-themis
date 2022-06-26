import React from 'react';
import { User } from '../utilities/APIGen';

export type ReadableContextType = {
    user?: User,
}

export type GlobalContextType = {
    // TODO: should this be mixed into the User type?
    user: {
        value?: User & {roles: string[]},
        set: (value?: User & {roles: string[]}) => void,
    },
}

export const defaultValue: GlobalContextType = {
    user: {
        set: () => {
            throw new Error('Context is not initialised!');
        },
    },
};

export const GlobalContext = React.createContext(defaultValue);
