import React, { ReactElement } from 'react';
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
import { MemoryRouter, Router } from 'react-router-dom';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import {
	makeEvent,
	promiseTimeout,
	randomEnts,
	randomState,
	randomVenue,
} from '../../TestUtils';
import { EventTable } from '../../../components/components/event-table/EventTable';
import { NotificationContext } from '../../../context/NotificationContext';

import 'react-dates/initialize';
// import { APIOverrides } from '../../../utilities/APIGen';
const APIOverrides = [];

const notificationRender = (ui: ReactElement, renderOptions: any = {}) => {
	return render(
		<NotificationContext.Provider
			value={{
				clearNotification: () => true,
				clearNotifications: () => 0,
				showNotification: () => '',
			}}
		>
			{ui}
		</NotificationContext.Provider>,
		renderOptions
	);
};

beforeAll(() => {
	// @ts-ignore
	JavascriptTimeAgo.addLocale(en);

	const success = (data: any) => ({ status: 'OK', result: data });

	APIOverrides.push(
		{
			uri: /\/states\/?$/i,
			response: success([randomState('ready')]),
			name: 'states response',
			method: 'get',
		},
		{
			uri: /\/venues\/?$/i,
			response: success([randomVenue('venue 3')]),
			method: 'get',
			name: 'venues get response',
		},
		{
			uri: /\/ents\/?$/i,
			response: success([randomEnts('signup')]),
			method: 'get',
			name: 'ents get response',
		}
	);
});

afterEach(() => {});

describe.skip('<EventTable />', () => {
	describe.skip('rendering', () => {
		it('renders all records', async () => {
			const { queryByTestId } = notificationRender(
				<MemoryRouter>
					<EventTable
						events={[
							makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id1'),
							makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id2'),
							makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id3'),
						]}
					/>
				</MemoryRouter>
			);

			expect(queryByTestId('et-row-id1')).not.toBeNull();
			expect(queryByTestId('et-row-id2')).not.toBeNull();
			expect(queryByTestId('et-row-id3')).not.toBeNull();
		});

		it('renders linked events', async () => {
			const history = createMemoryHistory();
			const { queryByText, getByText } = notificationRender(
				<Router history={history as any}>
					<EventTable
						events={[
							makeEvent('event1', new Date().getTime(), 1, 0, undefined, 'id1'),
							makeEvent('event2', new Date().getTime(), 1, 0, undefined, 'id2'),
						]}
					/>
				</Router>
			);

			expect(queryByText(/event1/gi)).not.toBeNull();
			fireEvent.click(getByText(/event1/gi));

			expect(history.location.pathname).toEqual('/events/id1');
		});
	});

	describe('functional', () => {
		it('name filter applies', async () => {
			const { queryByText, getByAltText } = notificationRender(
				<MemoryRouter>
					<EventTable
						events={[
							makeEvent(
								'event one',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id1'
							),
							makeEvent(
								'event two',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id2'
							),
							makeEvent(
								'event three',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id3'
							),
						]}
					/>
				</MemoryRouter>
			);

			fireEvent.input(getByAltText('Event Name'), { target: { value: 'two' } });
			expect(queryByText(/event one/gi)).toBeNull();
			expect(queryByText(/event two/gi)).not.toBeNull();
			expect(queryByText(/event three/gi)).toBeNull();
		});

		it('state filter applies', async () => {
			const { queryByText, getByTestId, getByRole } = notificationRender(
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
								{
									name: 'ready',
									id: 'readid',
									color: '#aeaeae',
									icon: 'coffee',
								}
							),
							makeEvent(
								'event two',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id2',
								{
									name: 'ready',
									id: 'readid',
									color: '#aeaeae',
									icon: 'coffee',
								}
							),
							makeEvent(
								'event three',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id3',
								{
									name: 'cancel',
									id: 'cancelid',
									color: '#aeaeae',
									icon: 'coffee',
								}
							),
						]}
					/>
				</MemoryRouter>
			);

			await promiseTimeout(async () => {
				// await fireEvent.click(getByTestId('launch-menu-state'));
				// await fireEvent.click(getByRole('option', { name: 'ready' }));
				expect(queryByText(/event one/gi)).not.toBeNull();
				expect(queryByText(/event two/gi)).not.toBeNull();
				expect(queryByText(/event three/gi)).toBeNull();
			}, 2000);
		});

		it('ents filter applies', async () => {
			const { queryByText, getByTestId, getByRole } = notificationRender(
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
								randomEnts('pending requirements')
							),
							makeEvent(
								'event two',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id2',
								undefined,
								randomEnts('signup')
							),
							makeEvent(
								'event three',
								new Date().getTime(),
								1,
								0,
								undefined,
								'id3',
								undefined,
								randomEnts('cancelled')
							),
						]}
					/>
				</MemoryRouter>
			);

			await promiseTimeout(async () => {
				// fireEvent.click(getByTestId('launch-menu-ents'));
				// fireEvent.click(getByRole('option', { name: 'signup' }));
				expect(queryByText(/event one/gi)).toBeNull();
				expect(queryByText(/event two/gi)).not.toBeNull();
				expect(queryByText(/event three/gi)).toBeNull();
			}, 2000);
		});

		it('venues filter applied', async () => {
			const { queryByText, getByTestId, getByRole } = notificationRender(
				<MemoryRouter>
					<EventTable
						events={[
							makeEvent(
								'event one',
								new Date().getTime(),
								1,
								0,
								randomVenue('venue 1'),
								'id1'
							),
							makeEvent(
								'event two',
								new Date().getTime(),
								1,
								0,
								randomVenue('venue 2'),
								'id2'
							),
							makeEvent(
								'event three',
								new Date().getTime(),
								1,
								0,
								randomVenue('venue 3'),
								'id3'
							),
						]}
					/>
				</MemoryRouter>
			);

			await promiseTimeout(async () => {
				fireEvent.click(getByTestId('launch-menu-venues'));
				fireEvent.click(getByRole('option', { name: 'venue 3' }));
				expect(queryByText(/event one/gi)).toBeNull();
				expect(queryByText(/event two/gi)).toBeNull();
				expect(queryByText(/event three/gi)).not.toBeNull();
			}, 2000);
		});
	});
});
