import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import FormInput from './FormInput.svelte';

describe('FormInput', () => {
	it('renders label and input', () => {
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Test Label',
				value: ''
			}
		});

		expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/test label/i)).toHaveAttribute('id', 'test');
	});

	it('shows optional text for non-required fields', () => {
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Name',
				required: false,
				value: ''
			}
		});

		expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument();
	});

	it('shows asterisk for required fields', () => {
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Email',
				required: true,
				value: ''
			}
		});

		expect(screen.getByText('*')).toBeInTheDocument();
	});

	it('displays error message when provided', () => {
		const errorMsg = 'This field is required';
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Test',
				value: '',
				error: errorMsg
			}
		});

		expect(screen.getByText(errorMsg)).toBeInTheDocument();
	});

	it('accepts user input', async () => {
		const user = userEvent.setup();
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Name',
				value: ''
			}
		});

		const input = screen.getByLabelText(/name/i);
		await user.type(input, 'John');

		expect(input).toHaveValue('John');
	});

	it('renders with correct input type', () => {
		render(FormInput, {
			props: {
				id: 'date',
				label: 'Date',
				type: 'date',
				value: ''
			}
		});

		const input = screen.getByLabelText(/date/i);
		expect(input).toHaveAttribute('type', 'date');
	});

	it('shows placeholder text', () => {
		render(FormInput, {
			props: {
				id: 'test',
				label: 'Name',
				value: '',
				placeholder: 'Enter your name'
			}
		});

		expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
	});
});
