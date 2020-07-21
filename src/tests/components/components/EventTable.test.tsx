import React from 'react';
import { render, fireEvent } from '@testing-library/react';

// Rendering
// - initially shows all records
// - events are linked
// Functional
// - filters work correctly
//   - name
//   - date
//   - state
//   - ents
//   - venues

import { createMemoryHistory } from 'history';
import { MemoryRouter, Router } from 'react-router';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { makeEvent } from '../../TestUtils';
import { EventTable } from '../../../components/components/event-table/EventTable';

import 'react-dates/initialize';

beforeAll(() => {
    JavascriptTimeAgo.addLocale(en);
});

describe('<EventTable />', () => {

    describe('rendering', () => {

        it('renders all records', async () => {
            const { queryByTestId } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id1'),
                            makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id2'),
                            makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id3'),
                        ]}
                    />
                </MemoryRouter>,
            );

            expect(queryByTestId('et-row-id1')).not.toBeNull();
            expect(queryByTestId('et-row-id2')).not.toBeNull();
            expect(queryByTestId('et-row-id3')).not.toBeNull();
        });

        it('renders linked events', async () => {
            const history = createMemoryHistory();
            const { queryByText, getByText } = render(
                <Router history={history}>
                    <EventTable
                        events={[
                            makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id1'),
                            makeEvent('event2', new Date().getTime(), 1, 0, undefined, 'id2'),
                        ]}
                    />
                </Router>,
            );

            expect(queryByText(/event1/ig)).not.toBeNull();
            fireEvent.click(getByText(/event1/ig));

            expect(history.location.pathname).toEqual('/events/id1');
        });

    });

    describe('functional', () => {

        it('name filter applies', async () => {
            const { queryByText, getByAltText } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent('event one', new Date().getTime(), 1, 0, undefined, 'id1'),
                            makeEvent('event two', new Date().getTime(), 1, 0, undefined, 'id2'),
                            makeEvent('event three', new Date().getTime(), 1, 0, undefined, 'id3'),
                        ]}
                    />
                </MemoryRouter>,
            );

            fireEvent.input(getByAltText('name'), { target: { value: 'two' } });
            expect(queryByText(/event one/ig)).toBeNull();
            expect(queryByText(/event two/ig)).not.toBeNull();
            expect(queryByText(/event three/ig)).toBeNull();
        });

        it('state filter applies', async () => {
            const { queryByText, getByTestId, getByRole } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent('event one', new Date().getTime(), 1, 0, undefined, 'id1', { state: 'ready' }),
                            makeEvent('event two', new Date().getTime(), 1, 0, undefined, 'id2', { state: 'ready' }),
                            makeEvent('event three', new Date().getTime(), 1, 0, undefined, 'id3', { state: 'cancel' }),
                        ]}
                    />
                </MemoryRouter>,
            );

            fireEvent.click(getByTestId('launch-menu-state'));
            fireEvent.click(getByRole('option', { name: 'ready' }));
            expect(queryByText(/event one/ig)).not.toBeNull();
            expect(queryByText(/event two/ig)).not.toBeNull();
            expect(queryByText(/event three/ig)).toBeNull();
        });

        it('ents filter applies', async () => {
            const { queryByText, getByTestId, getByRole } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent(
                                'event one',
                                new Date().getTime(),
                                1,
                                0,
                                undefined,
                                'id1',
                                undefined,
                                { name: 'pending requirements' },
                            ),
                            makeEvent(
                                'event two',
                                new Date().getTime(),
                                1,
                                0,
                                undefined,
                                'id2',
                                undefined,
                                { name: 'signup' },
                            ),
                            makeEvent(
                                'event three',
                                new Date().getTime(),
                                1,
                                0,
                                undefined,
                                'id3',
                                undefined,
                                { name: 'cancelled' },
                            ),
                        ]}
                    />
                </MemoryRouter>,
            );

            fireEvent.click(getByTestId('launch-menu-ents'));
            fireEvent.click(getByRole('option', { name: 'signup' }));
            expect(queryByText(/event one/ig)).toBeNull();
            expect(queryByText(/event two/ig)).not.toBeNull();
            expect(queryByText(/event three/ig)).toBeNull();
        });

        it('venues filter applied', async () => {
            const { queryByText, getByTestId, getByRole } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent(
                                'event one',
                                new Date().getTime(),
                                1,
                                0,
                                'venue 1',
                                'id1',
                            ),
                            makeEvent(
                                'event two',
                                new Date().getTime(),
                                1,
                                0,
                                'venue 2',
                                'id2',
                            ),
                            makeEvent(
                                'event three',
                                new Date().getTime(),
                                1,
                                0,
                                'venue 3',
                                'id3',
                            ),
                        ]}
                    />
                </MemoryRouter>,
            );

            fireEvent.click(getByTestId('launch-menu-venues'));
            fireEvent.click(getByRole('option', { name: 'venue 3' }));
            expect(queryByText(/event one/ig)).toBeNull();
            expect(queryByText(/event two/ig)).toBeNull();
            expect(queryByText(/event three/ig)).not.toBeNull();
        });

    });
});
