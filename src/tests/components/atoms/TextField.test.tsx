import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { cleanDOMTest } from '../../TestUtils';

// Rendering checks:
// - no label hides label (query fails)
// - required adds notation
// - type renders the correct field
// - initial content populates field
// Functionality checks
// - onchange listener is executed

describe('<TextField />', () => {
	describe('rendering', () => {
		it('noLabel property hides label', () => {
			let { queryByText } = render(<TextField name="something" noLabel />);
			expect(queryByText(/something/gi)).toBeNull();

			queryByText = render(<TextField name="something" />).queryByText;
			expect(queryByText(/something/gi)).not.toBeNull();
		});

		it('required property adds required string', async () => {
			await cleanDOMTest(() => {
				const { queryByText } = render(<TextField name="something" />);
				expect(queryByText(/required/gi)).toBeNull();
			});

			await cleanDOMTest(() => {
				const { queryByText } = render(<TextField name="something" required />);
				expect(queryByText(/required/gi)).not.toBeNull();
				expect(queryByText(/required/gi)).toBeVisible();
			});

			await cleanDOMTest(() => {
				const { queryByText } = render(
					<TextField name="something" noLabel required />
				);
				expect(queryByText(/required/gi)).not.toBeNull();
				expect(queryByText(/required/gi)).toBeVisible();
			});
		});

		it('type property renders correct element', async () => {
			await cleanDOMTest(() => {
				const { getByRole } = render(<TextField name="something" />);

				expect(getByRole('textbox').tagName).toEqual('INPUT');
			});

			await cleanDOMTest(() => {
				const { getByRole } = render(
					<TextField name="something" type="textarea" />
				);

				expect(getByRole('textbox').tagName).toEqual('TEXTAREA');
			});
		});

		it('initialContent property populates filed', async () => {
			await cleanDOMTest(() => {
				const { getByRole } = render(<TextField name="something" />);
				// @ts-ignore - see below
				expect(getByRole('textbox').value).toEqual('');
			});
			await cleanDOMTest(() => {
				const { getByRole } = render(
					<TextField name="something" initialContent="some content" />
				);
				// @ts-ignore - value does exist but only on input nodes
				expect(getByRole('textbox').value).toEqual('some content');
			});
		});
	});

	describe('functionality', () => {
		it('onChange property is executed on update', () => {
			const fn = jest.fn();

			const { getByRole } = render(
				<TextField name="something" onChange={fn} />
			);
			fireEvent.input(getByRole('textbox'), { target: { value: 'a' } });
			expect(fn).toBeCalledWith('a');

			fireEvent.input(getByRole('textbox'), {
				target: { value: 'some content' },
			});
			expect(fn).toBeCalledWith('some content');
		});
	});
});
