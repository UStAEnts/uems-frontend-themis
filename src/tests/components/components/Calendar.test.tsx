import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Calendar } from '../../../components/components/calendar/Calendar';
import { cleanDOMTest, makeEvent } from '../../TestUtils';

// Render tests
// - events are rendered
// - events in range are rendered
// - start date is respected
// Functionality tests
// - next and back buttons move calendar
// - moving renders the right events

const hrToMs = (hour: number) => hour * 60 * 60;

describe('<Calendar />', () => {
	const start = 1594745361886;

	describe('render', () => {
		it('events are rendered in the calendar', async () => {
			const { queryByText } = render(
				<Calendar
					events={[makeEvent('named event', start / 1000 + hrToMs(1), 3)]}
					startDate={new Date(start)}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			const element = queryByText(/named event/gi);

			expect(element).not.toBeNull();
			expect(element).toBeVisible();
		});

		it('events in a range are rendered', async () => {
			const { queryByText } = render(
				<Calendar
					events={[
						makeEvent('named event 0', start / 1000 + hrToMs(1), 3),
						makeEvent('named event 2', start / 1000 + hrToMs(27), 3),
						// 8 days in the future, outside of the range
						makeEvent('named event 3', start / 1000 + hrToMs(192), 3),
						// 3 days in the past, outside of the range
						makeEvent('named event 4', start / 1000 + hrToMs(-72), 3),
					]}
					startDate={new Date(start)}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			let element = queryByText(/named event 0/gi);
			expect(element).not.toBeNull();
			expect(element).toBeVisible();

			element = queryByText(/named event 2/gi);
			expect(element).not.toBeNull();
			expect(element).toBeVisible();

			element = queryByText(/named event 3/gi);
			expect(element).toBeNull();

			element = queryByText(/named event 4/gi);
			expect(element).toBeNull();
		});

		it('start date is rounded to sunday', async () => {
			await cleanDOMTest(() => {
				const { getByTestId } = render(
					<Calendar
						events={[makeEvent('named event', start + hrToMs(1), 3)]}
						startDate={new Date(start)}
					/>,
					{
						wrapper: MemoryRouter,
					}
				);

				expect(getByTestId('n0-header').textContent).toEqual('Sunday12July');
			});

			await cleanDOMTest(() => {
				const { getByTestId } = render(
					<Calendar
						events={[makeEvent('named event', start, 3)]}
						// 6 days in the future
						startDate={new Date(start + hrToMs(6 * 24) * 1000)}
					/>,
					{
						wrapper: MemoryRouter,
					}
				);

				expect(getByTestId('n0-header').textContent).toEqual('Sunday19July');
			});
		});
	});

	describe('functionality', () => {
		it('next and previous move start date', () => {
			const { getByTestId, getByText } = render(
				<Calendar
					events={[makeEvent('named event', start + hrToMs(1), 3)]}
					startDate={new Date(start)}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			expect(getByTestId('n0-header').textContent).toEqual('Sunday12July');
			fireEvent.click(getByText('Minus One'));
			expect(getByTestId('n0-header').textContent).toEqual('Saturday11July');
			fireEvent.click(getByText('Minus One'));
			expect(getByTestId('n0-header').textContent).toEqual('Friday10July');
			fireEvent.click(getByText('Add One'));
			expect(getByTestId('n0-header').textContent).toEqual('Saturday11July');
		});

		it('moving date renders new events', () => {
			const { getByTestId, getByText, queryByText } = render(
				<Calendar
					events={[
						makeEvent(
							'12th event',
							new Date(2020, 6, 12, 10).getTime() / 1000,
							3
						),
						makeEvent(
							'11th event',
							new Date(2020, 6, 11, 10).getTime() / 1000,
							3
						),
						makeEvent(
							'10th event',
							new Date(2020, 6, 10, 10).getTime() / 1000,
							3
						),
					]}
					startDate={new Date(2020, 6, 13)}
				/>,
				{
					wrapper: MemoryRouter,
				}
			);

			expect(getByTestId('n0-header').textContent).toEqual('Sunday12July');
			expect(queryByText('12th event')).not.toBeNull();
			expect(queryByText('11th event')).toBeNull();
			expect(queryByText('10th event')).toBeNull();

			fireEvent.click(getByText('Minus One'));

			expect(getByTestId('n0-header').textContent).toEqual('Saturday11July');
			expect(queryByText('12th event')).not.toBeNull();
			expect(queryByText('11th event')).not.toBeNull();
			expect(queryByText('10th event')).toBeNull();

			fireEvent.click(getByText('Minus One'));

			expect(getByTestId('n0-header').textContent).toEqual('Friday10July');
			expect(queryByText('12th event')).not.toBeNull();
			expect(queryByText('11th event')).not.toBeNull();
			expect(queryByText('10th event')).not.toBeNull();

			fireEvent.click(getByText('Add One'));

			expect(getByTestId('n0-header').textContent).toEqual('Saturday11July');
			expect(queryByText('12th event')).not.toBeNull();
			expect(queryByText('11th event')).not.toBeNull();
			expect(queryByText('10th event')).toBeNull();
		});
	});
});
