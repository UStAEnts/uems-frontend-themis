import React from 'react';
import { User } from '../types/Event';

export type ReadableContextType = {
    user?: User,
}

export type GlobalContextType = {
    user: {
        value?: User,
        set: (value?: User) => void,
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
