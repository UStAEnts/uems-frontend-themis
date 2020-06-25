import * as React from 'react';

export default class InputUtilities {

    /**
     * If the keyCode matches the target key it will call the function with the given thisArg and arguments
     * @param e the keyboard event produced by react
     * @param targetKey the key which should be pressed
     * @param func the function which should be executed on a match
     * @param thisArg the this argument for the called function
     * @param args the arguments to call the function with
     */
    static bindKeyPress(e: React.KeyboardEvent, targetKey: number, func: Function, thisArg: any, ...args: any[]) {
        if (e.keyCode === targetKey) func.apply(thisArg, args);
    }

    /**
     * If the keyCode matches the target key it will call the function with no arguments and the 'this' from this
     * context
     * @param e the keyboard event produced by react
     * @param targetKey the key which should be pressed
     * @param func the function which should be executed on a match
     */
    static bindSimplePress(e: React.KeyboardEvent, targetKey: number, func: Function) {
        if (e.keyCode === targetKey) func();
    }

    /**
     * Returns a function which takes only a React.KeyboardEvent which can be passed directly into a handler but will
     * call {@link bindKeyPress} with all the given properties
     * @param targetKey the key which should be pressed
     * @param func the function which should be executed on a match
     * @param thisArg the this argument for the called function
     * @param args the arguments to call the function with
     */
    static higherOrderPress(targetKey: number, func: Function, thisArg: any, ...args: any[]) {
        return function highOrderBindPress(e: React.KeyboardEvent) {
            InputUtilities.bindKeyPress.apply(thisArg, [e, targetKey, func, thisArg, ...args]);
        };
    }

}
