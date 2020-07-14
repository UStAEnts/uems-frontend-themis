import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Select } from '../../../components/atoms/select/Select';
import { mockDocumentEvents, promiseTimeout } from '../../TestUtils';

describe('select', () => {
    it('pressing select opens menu', () => {
        const { getByRole } = render(<Select placeholder="Something" name="xinput" options={['a', 'b', 'c']} />);

        fireEvent.click(getByRole('button', { name: 'launch-menu' }));
        expect(getByRole('listbox')).toBeVisible();
    });

    it('pressing outside select closes menu', (done) => {
        let trigger: undefined | Function;
        mockDocumentEvents({
            // Listen for the mouse down register so we can grab the listener attached to the document outside the
            // select
            mousedown: (event: string, handler: Function) => {
                trigger = handler;
            },
        }, undefined, () => {
            const { getByRole, getByTestId, queryByRole } = render(
                <div data-testid="outside">
                    <Select placeholder="Something" name="xinput" options={['a', 'b', 'c']} />
                </div>,
            );

            fireEvent.click(getByRole('button', { name: 'launch-menu' }));
            expect(getByRole('listbox')).toBeVisible();

            // The document listener won't work so we need to just simulate it
            if (trigger) trigger({ target: getByTestId('outside') });
            else console.warn('Trigger was never initialised');

            // We have a transition state in this component so we need to wait until the CSS animation has finished
            promiseTimeout(() => {
                expect(queryByRole('listbox')).toBeNull();
                done();
            }, 3000);
        });
    });

    it('selecting an option closes menu', () => {
        const { getByRole, getByText, queryByRole } = render(
            <Select placeholder="Something" name="xinput" options={['a test option', 'b', 'c']} />,
        );

        fireEvent.click(getByRole('button', { name: 'launch-menu' }));
        expect(getByRole('listbox')).toBeVisible();
        fireEvent.click(getByText('a test option'));

        // We have a transition state in this component so we need to wait until the CSS animation has finished
        return promiseTimeout(() => {
            expect(queryByRole('listbox')).toBeNull();
        }, 3000);
    });

    it('selecting an option updates render', () => {
        const { getByRole, getByText } = render(
            <Select placeholder="Something" name="xinput" options={['a test option', 'b', 'c']} />,
        );

        fireEvent.click(getByRole('button', { name: 'launch-menu' }));
        expect(getByRole('listbox')).toBeVisible();
        fireEvent.click(getByText('a test option'));

        // We have a transition state in this component so we need to wait until the CSS animation has finished
        return promiseTimeout(() => {
            expect(getByRole('button', { name: 'launch-menu' })).toHaveTextContent('a test option');
        }, 3000);
    });

    it('selecting an option calls handler', () => {
        const fn = jest.fn();

        const { getByRole, getByText } = render(
            <Select
                placeholder="Something"
                name="xinput"
                options={['a test option', 'b', 'c']}
                onSelectListener={fn}
            />,
        );

        expect(fn).not.toBeCalled();
        fireEvent.click(getByRole('button', { name: 'launch-menu' }));
        expect(getByRole('listbox')).toBeVisible();
        fireEvent.click(getByText('a test option'));
        expect(fn).toBeCalledTimes(1);
    });
});
