import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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
import { makeEvent, promiseTimeout, randomEnts, randomState, randomVenue } from '../../TestUtils';
import { EventTable } from '../../../components/components/event-table/EventTable';

import 'react-dates/initialize';

beforeAll(() => {
    JavascriptTimeAgo.addLocale(en);

    const mock = new MockAdapter(axios);
    mock.onGet(/\/states\/?$/i).reply(200, {
        status: 'OK',
        result: [randomState('ready')],
    });
    mock.onGet(/\/venues\/?$/i).reply(200, {
        status: 'OK',
        result: [randomVenue('venue 3')],
    });
    mock.onGet(/\/ents\/?$/i).reply(200, {
        status: 'OK',
        result: [randomEnts('signup')],
    });
});

afterEach(() => {
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

            fireEvent.input(getByAltText('Event Name'), { target: { value: 'two' } });
            expect(queryByText(/event one/ig)).toBeNull();
            expect(queryByText(/event two/ig)).not.toBeNull();
            expect(queryByText(/event three/ig)).toBeNull();
        });

        it('state filter applies', async () => {
            const { queryByText, getByTestId, getByRole } = render(
                <MemoryRouter>
                    <EventTable
                        events={[
                            makeEvent('event one', new Date().getTime(), 1, 0, undefined, 'id1', {
                                name: 'ready',
                                id: 'readid',
                                color: '#aeaeae',
                                icon: 'coffee',
                            }),
                            makeEvent('event two', new Date().getTime(), 1, 0, undefined, 'id2', {
                                name: 'ready',
                                id: 'readid',
                                color: '#aeaeae',
                                icon: 'coffee',
                            }),
                            makeEvent('event three', new Date().getTime(), 1, 0, undefined, 'id3', {
                                name: 'cancel',
                                id: 'cancelid',
                                color: '#aeaeae',
                                icon: 'coffee',
                            }),
                        ]}
                    />
                </MemoryRouter>,
            );

            await promiseTimeout(async () => {
                await fireEvent.click(getByTestId('launch-menu-state'));
                await fireEvent.click(getByRole('option', { name: 'ready' }));
                expect(queryByText(/event one/ig)).not.toBeNull();
                expect(queryByText(/event two/ig)).not.toBeNull();
                expect(queryByText(/event three/ig)).toBeNull();
            }, 500);
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
                                randomEnts('pending requirements'),
                            ),
                            makeEvent(
                                'event two',
                                new Date().getTime(),
                                1,
                                0,
                                undefined,
                                'id2',
                                undefined,
                                randomEnts('signup'),
                            ),
                            makeEvent(
                                'event three',
                                new Date().getTime(),
                                1,
                                0,
                                undefined,
                                'id3',
                                undefined,
                                randomEnts('cancelled'),
                            ),
                        ]}
                    />
                </MemoryRouter>,
            );

            await promiseTimeout(async () => {
                fireEvent.click(getByTestId('launch-menu-ents'));
                fireEvent.click(getByRole('option', { name: 'signup' }));
                expect(queryByText(/event one/ig)).toBeNull();
                expect(queryByText(/event two/ig)).not.toBeNull();
                expect(queryByText(/event three/ig)).toBeNull();
            }, 500);
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
                                randomVenue('venue 1'),
                                'id1',
                            ),
                            makeEvent(
                                'event two',
                                new Date().getTime(),
                                1,
                                0,
                                randomVenue('venue 2'),
                                'id2',
                            ),
                            makeEvent(
                                'event three',
                                new Date().getTime(),
                                1,
                                0,
                                randomVenue('venue 3'),
                                'id3',
                            ),
                        ]}
                    />
                </MemoryRouter>,
            );

            await promiseTimeout(async () => {
                fireEvent.click(getByTestId('launch-menu-venues'));
                fireEvent.click(getByRole('option', { name: 'venue 3' }));
                expect(queryByText(/event one/ig)).toBeNull();
                expect(queryByText(/event two/ig)).toBeNull();
                expect(queryByText(/event three/ig)).not.toBeNull();
            }, 500);
        });

    });
});
