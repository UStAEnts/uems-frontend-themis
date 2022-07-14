import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { cleanDOMTest } from '../../TestUtils';
import { Filter } from '../../../components/components/filter/Filter';
// Rendering
// - fields match configuration
// Functional
// - updates call handlers
//   - date
//   - number
//   - options
//   - search

describe('<Filter />', () => {
	describe('rendering', () => {
		it('fields match configuration', async () => {
			await cleanDOMTest(() => {
				const { queryByAltText } = render(
					<Filter
						filters={{
							number: {
								name: 'number',
								type: 'number',
							},
						}}
					/>
				);

				expect(queryByAltText('number')).not.toBeNull();
			});

			await cleanDOMTest(() => {
				const { queryByRole } = render(
					<Filter
						filters={{
							number: {
								name: 'number',
								type: 'option',
								options: ['a', 'b', 'c'],
							},
						}}
					/>
				);

				expect(queryByRole('button')).not.toBeNull();
			});

			await cleanDOMTest(() => {
				const { queryByAltText } = render(
					<Filter
						filters={{
							number: {
								name: 'number',
								type: 'search',
							},
						}}
					/>
				);

				expect(queryByAltText('number')).not.toBeNull();
			});
		});
	});

	describe('functional', () => {
		it('number update calls handler', async () => {
			const fn = jest.fn();

			const { getByAltText } = render(
				<Filter
					filters={{
						number: {
							name: 'number',
							type: 'number',
						},
					}}
					onFilterChange={fn}
				/>
			);

			expect(fn).not.toBeCalled();
			fireEvent.input(getByAltText('number'), { target: { value: 10 } });
			expect(fn).toBeCalled();
			expect(fn).toBeCalledWith({
				number: {
					value: 10,
				},
			});
			fireEvent.input(getByAltText('number'), { target: { value: 20 } });
			expect(fn).toBeCalledWith({
				number: {
					value: 20,
				},
			});
		});

		it('options update calls handler', async () => {
			await cleanDOMTest(() => {
				const fn = jest.fn();

				const { getByRole, getByText } = render(
					<Filter
						filters={{
							number: {
								name: 'number',
								type: 'option',
								options: ['a option', 'bopt', 'c'],
							},
						}}
						onFilterChange={fn}
					/>
				);

				expect(fn).not.toBeCalled();
				fireEvent.click(getByRole('button'));
				fireEvent.click(getByText(/a option/gi));
				expect(fn).toBeCalled();
				expect(fn).toBeCalledWith({
					number: {
						selectedOption: 'a option',
					},
				});
				fireEvent.click(getByRole('button'));
				fireEvent.click(getByText(/bopt/gi));
				expect(fn).toBeCalled();
				expect(fn).toBeCalledWith({
					number: {
						selectedOption: 'bopt',
					},
				});
			});

			await cleanDOMTest(() => {
				const fn = jest.fn();

				const { getByRole, getByText } = render(
					<Filter
						filters={{
							number: {
								name: 'number',
								type: 'option',
								options: [
									{
										value: 'key',
										text: 'option',
									},
									{
										value: 'two',
										text: 'second',
									},
								],
							},
						}}
						onFilterChange={fn}
					/>
				);

				expect(fn).not.toBeCalled();
				fireEvent.click(getByRole('button'));
				fireEvent.click(getByText(/option/gi));
				expect(fn).toBeCalled();
				expect(fn).toBeCalledWith({
					number: {
						selectedOption: {
							value: 'key',
							text: 'option',
						},
					},
				});
			});
		});

		it('search updates calls handler', async () => {
			const fn = jest.fn();

			const { getByAltText } = render(
				<Filter
					filters={{
						number: {
							name: 'number',
							type: 'search',
						},
					}}
					onFilterChange={fn}
				/>
			);

			expect(fn).not.toBeCalled();
			fireEvent.input(getByAltText('number'), {
				target: { value: 'some content' },
			});
			expect(fn).toBeCalled();
			expect(fn).toBeCalledWith({
				number: {
					content: 'some content',
				},
			});
			fireEvent.input(getByAltText('number'), { target: { value: 'content' } });
			expect(fn).toBeCalledWith({
				number: {
					content: 'content',
				},
			});
		});
	});
});
