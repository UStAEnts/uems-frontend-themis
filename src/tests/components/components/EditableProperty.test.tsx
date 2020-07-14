import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { EditableProperty } from "../../../components/components/editable-property/EditableProperty";

// Render
// - renders child
// - edit button is present
// Functional
// - clicking edit produces input field
// - clicking save calls callback and returns state
// - clicking cancel reverts without calling callback

describe('<EditableProperty />', () => {

    describe('render', () => {

        it('renders default property', () => {
            const { queryByText } = render(
                <EditableProperty
                    name="Property"
                    config={{
                        type: 'select',
                        options: [],
                    }}
                >
                    <p>Some basic content</p>
                </EditableProperty>,
            );

            expect(queryByText('Some basic content')).not.toBeNull();
            expect(queryByText('Some basic content')).toBeVisible();
        });

        it('renders an edit button', () => {
            const { queryByText } = render(
                <EditableProperty
                    name="Property"
                    config={{
                        type: 'select',
                        options: [],
                    }}
                >
                    <p>Some basic content</p>
                </EditableProperty>,
            );

            expect(queryByText(/(Edit\.\.\.)/ig)).not.toBeNull();
            expect(queryByText(/(Edit\.\.\.)/ig)).toBeVisible();
        });

    });

    describe('functional', () => {

        it('editing produces input field', () => {
            const { queryByText, queryByRole, getByRole } = render(
                <EditableProperty
                    name="Property"
                    config={{
                        type: 'select',
                        options: [],
                    }}
                >
                    <p>Some basic content</p>
                </EditableProperty>,
            );

            fireEvent.click(getByRole('button'));
            expect(queryByRole('listbox')).not.toBeNull();
            expect(queryByRole('listbox')).toBeVisible();
            expect(queryByText(/(Edit\.\.\.)/ig)).toBeNull();
        });

        it('saving triggers callback and reverts state', () => {
            const fn = jest.fn();

            const { queryByText, queryByRole, getByRole, getByText } = render(
                <EditableProperty
                    name="Property"
                    config={{
                        type: 'select',
                        options: ['option 1'],
                        onChange: fn,
                    }}
                >
                    <p>Some basic content</p>
                </EditableProperty>,
            );

            fireEvent.click(getByRole('button'));
            fireEvent.click(getByRole('button', { name: 'launch-menu' }));
            fireEvent.click(getByText('option 1'));
            fireEvent.click(getByText('Save'));

            expect(queryByRole('listbox')).toBeNull();
            expect(queryByText(/(Edit\.\.\.)/ig)).not.toBeNull();

            expect(fn).toBeCalledTimes(1);
            expect(fn).toBeCalledWith('option 1');
        });

        it('cancelling does not trigger callback and reverts state', () => {

            const fn = jest.fn();

            const { queryByText, queryByRole, getByRole, getByText } = render(
                <EditableProperty
                    name="Property"
                    config={{
                        type: 'select',
                        options: ['option 1'],
                        onChange: fn,
                    }}
                >
                    <p>Some basic content</p>
                </EditableProperty>,
            );

            fireEvent.click(getByRole('button'));
            fireEvent.click(getByText('Cancel'));

            expect(queryByRole('listbox')).toBeNull();
            expect(queryByText(/(Edit\.\.\.)/ig)).not.toBeNull();

            expect(fn).not.toBeCalled();
        });

    });

});
