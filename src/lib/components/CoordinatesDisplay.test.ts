import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CoordinatesDisplay from './CoordinatesDisplay.svelte';

describe('CoordinatesDisplay', () => {
	it('renders all field labels', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});
		expect(screen.getByText('Latitude')).toBeInTheDocument();
		expect(screen.getByText('Longitude')).toBeInTheDocument();
		expect(screen.getByText('UTC Offset')).toBeInTheDocument();
	});

	it('displays dash placeholder when all values are null', () => {
		const { container } = render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});

		const values = container.querySelectorAll('.font-mono');
		expect(values[0]).toHaveTextContent('—');
		expect(values[1]).toHaveTextContent('—');
		expect(values[2]).toHaveTextContent('—');
	});

	it('formats latitude to 6 decimal places', () => {
		const { container } = render(CoordinatesDisplay, {
			props: { latitude: 40.712776, longitude: null, utcOffset: null }
		});

		expect(screen.getByText('40.712776')).toBeInTheDocument();
	});

	it('formats longitude to 6 decimal places', () => {
		const { container } = render(CoordinatesDisplay, {
			props: { latitude: null, longitude: -74.005974, utcOffset: null }
		});

		expect(screen.getByText('-74.005974')).toBeInTheDocument();
	});

	it('formats positive UTC offset correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 5 }
		});

		expect(screen.getByText('UTC +5')).toBeInTheDocument();
	});

	it('formats negative UTC offset correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: -8 }
		});

		expect(screen.getByText('UTC -8')).toBeInTheDocument();
	});

	it('formats UTC offset of zero correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 0 }
		});

		expect(screen.getByText('UTC +0')).toBeInTheDocument();
	});

	it('displays all values when provided', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 51.507351, longitude: -0.127758, utcOffset: 1 }
		});

		expect(screen.getByText('51.507351')).toBeInTheDocument();
		expect(screen.getByText('-0.127758')).toBeInTheDocument();
		expect(screen.getByText('UTC +1')).toBeInTheDocument();
	});

	it('displays values as text (read-only)', () => {
		const { container } = render(CoordinatesDisplay, {
			props: { latitude: 40.712776, longitude: -74.005974, utcOffset: -5 }
		});

		// Verify there are no input elements (it's display-only)
		const inputs = container.querySelectorAll('input');
		expect(inputs.length).toBe(0);
	});

	it('handles decimal UTC offsets', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 5.5 }
		});

		expect(screen.getByText('UTC +5.5')).toBeInTheDocument();
	});

	it('truncates latitude with more than 6 decimal places', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.71277612345, longitude: null, utcOffset: null }
		});

		expect(screen.getByText('40.712776')).toBeInTheDocument();
	});

	it('pads latitude with fewer decimal places to 6 digits', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.7, longitude: null, utcOffset: null }
		});

		expect(screen.getByText('40.700000')).toBeInTheDocument();
	});

	it('handles very large positive latitude', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 85.123456, longitude: null, utcOffset: null }
		});

		expect(screen.getByText('85.123456')).toBeInTheDocument();
	});

	it('handles very large negative longitude', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: -179.999999, utcOffset: null }
		});

		expect(screen.getByText('-179.999999')).toBeInTheDocument();
	});
});
