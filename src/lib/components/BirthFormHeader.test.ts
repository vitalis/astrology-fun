import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BirthFormHeader from './BirthFormHeader.svelte';

describe('BirthFormHeader', () => {
	it('renders the title', () => {
		render(BirthFormHeader);
		expect(screen.getByText('Birth Chart Calculator')).toBeInTheDocument();
	});

	it('renders the subtitle', () => {
		render(BirthFormHeader);
		expect(screen.getByText('Discover your cosmic blueprint')).toBeInTheDocument();
	});

	it('has proper heading hierarchy', () => {
		render(BirthFormHeader);
		const heading = screen.getByRole('heading', { level: 1 });
		expect(heading).toHaveTextContent('Birth Chart Calculator');
	});
});
