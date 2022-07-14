import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Pane, TabPane } from '../../../components/components/tab-pane/TabPane';
import { cleanDOMTest } from '../../TestUtils';
import '@testing-library/jest-dom/extend-expect';

// Rendering
// - tabs are shown
// - active tab is shown
// Functional
// - tab switching works
// - tab unmounting works

const paneSetup: Pane[] = [
	{
		key: 'tab1',
		name: 'Tab One',
		content: <div>Content One</div>,
	},
	{
		key: 'tab2',
		name: 'Tab Two',
		content: <div>Content Two</div>,
	},
	{
		key: 'tab3',
		name: 'Tab Three',
		content: <div>Content Three</div>,
	},
];

describe('<TabPane />', () => {
	describe('render', () => {
		it('tabs are shown', async () => {
			const { queryByText } = render(<TabPane panes={paneSetup} />);

			expect(queryByText(/tab one/gi)).not.toBeNull();
			expect(queryByText(/tab two/gi)).not.toBeNull();
			expect(queryByText(/tab three/gi)).not.toBeNull();
		});

		it('active tab is shown', async () => {
			await cleanDOMTest(() => {
				const { queryByText } = render(<TabPane panes={paneSetup} />);

				expect(queryByText(/tab one/gi)).not.toBeNull();
				expect(queryByText(/tab two/gi)).not.toBeNull();
				expect(queryByText(/tab three/gi)).not.toBeNull();
				expect(queryByText(/content one/gi)).not.toBeNull();
			});

			await cleanDOMTest(() => {
				const setup = [
					{ ...paneSetup[0] },
					{
						...paneSetup[1],
						...{
							initial: true,
						},
					},
					{ ...paneSetup[2] },
				];

				const { queryByText } = render(<TabPane panes={setup} />);

				expect(queryByText(/tab one/gi)).not.toBeNull();
				expect(queryByText(/tab two/gi)).not.toBeNull();
				expect(queryByText(/tab three/gi)).not.toBeNull();
				expect(queryByText(/content two/gi)).not.toBeNull();
			});
		});
	});

	describe('functional', () => {
		it('tab switching works', async () => {
			const { queryByText, getByText } = render(<TabPane panes={paneSetup} />);

			expect(queryByText(/tab one/gi)).not.toBeNull();
			expect(queryByText(/tab two/gi)).not.toBeNull();
			expect(queryByText(/tab three/gi)).not.toBeNull();

			expect(getByText(/content one/gi).parentElement).toHaveClass('active');
			expect(getByText(/content two/gi).parentElement).not.toHaveClass(
				'active'
			);
			expect(getByText(/content three/gi).parentElement).not.toHaveClass(
				'active'
			);

			await fireEvent.click(getByText(/tab two/gi));

			expect(getByText(/content one/gi).parentElement).not.toHaveClass(
				'active'
			);
			expect(getByText(/content two/gi).parentElement).toHaveClass('active');
			expect(getByText(/content three/gi).parentElement).not.toHaveClass(
				'active'
			);

			fireEvent.click(getByText(/tab three/gi));
			expect(getByText(/content one/gi).parentElement).not.toHaveClass(
				'active'
			);
			expect(getByText(/content two/gi).parentElement).not.toHaveClass(
				'active'
			);
			expect(getByText(/content three/gi).parentElement).toHaveClass('active');
		});

		it('tab switching works when unmounting', async () => {
			const { queryByText, getByText } = render(
				<TabPane panes={paneSetup} unmountHidden />
			);

			expect(queryByText(/tab one/gi)).not.toBeNull();
			expect(queryByText(/tab two/gi)).not.toBeNull();
			expect(queryByText(/tab three/gi)).not.toBeNull();

			expect(queryByText(/content one/gi)).not.toBeNull();
			expect(queryByText(/content two/gi)).toBeNull();
			expect(queryByText(/content three/gi)).toBeNull();

			await fireEvent.click(getByText(/tab two/gi));

			expect(queryByText(/content one/gi)).toBeNull();
			expect(queryByText(/content two/gi)).not.toBeNull();
			expect(queryByText(/content three/gi)).toBeNull();

			await fireEvent.click(getByText(/tab three/gi));

			expect(queryByText(/content one/gi)).toBeNull();
			expect(queryByText(/content two/gi)).toBeNull();
			expect(queryByText(/content three/gi)).not.toBeNull();
		});

		it('tab switching calls listener', async () => {
			const fn = jest.fn();

			const { getByText } = render(
				<TabPane
					panes={paneSetup}
					unmountHidden
					listeners={{
						onTabChange: fn,
					}}
				/>
			);

			expect(fn).not.toBeCalled();

			await fireEvent.click(getByText(/tab one/gi));

			expect(fn).toBeCalledWith(paneSetup[0], paneSetup[0]);

			await fireEvent.click(getByText(/tab two/gi));

			expect(fn).toBeCalledWith(paneSetup[0], paneSetup[1]);

			await fireEvent.click(getByText(/tab three/gi));

			expect(fn).toBeCalledWith(paneSetup[1], paneSetup[2]);
		});
	});
});
