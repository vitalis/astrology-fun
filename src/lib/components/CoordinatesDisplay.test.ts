import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CoordinatesDisplay from './CoordinatesDisplay.svelte';

describe('CoordinatesDisplay', () => {
	it('renders the section header', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});
		expect(screen.getByText(/coordinates \(auto-filled\)/i)).toBeInTheDocument();
	});

	it('renders all field labels', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});
		expect(screen.getByText('Latitude')).toBeInTheDocument();
		expect(screen.getByText('Longitude')).toBeInTheDocument();
		expect(screen.getByText('UTC Offset')).toBeInTheDocument();
	});

	it('displays empty inputs when all values are null', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;

		expect(latitudeInput.value).toBe('');
		expect(longitudeInput.value).toBe('');
		expect(utcOffsetInput.value).toBe('');
	});

	it('formats latitude to 6 decimal places', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.712776, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		expect(latitudeInput.value).toBe('40.712776');
	});

	it('formats longitude to 6 decimal places', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: -74.005974, utcOffset: null }
		});

		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		expect(longitudeInput.value).toBe('-74.005974');
	});

	it('formats positive UTC offset correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 5 }
		});

		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;
		expect(utcOffsetInput.value).toBe('UTC +5');
	});

	it('formats negative UTC offset correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: -8 }
		});

		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;
		expect(utcOffsetInput.value).toBe('UTC -8');
	});

	it('formats UTC offset of zero correctly', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 0 }
		});

		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;
		expect(utcOffsetInput.value).toBe('UTC +0');
	});

	it('displays all values when provided', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 51.507351, longitude: -0.127758, utcOffset: 1 }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;

		expect(latitudeInput.value).toBe('51.507351');
		expect(longitudeInput.value).toBe('-0.127758');
		expect(utcOffsetInput.value).toBe('UTC +1');
	});

	it('all inputs are read-only', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.712776, longitude: -74.005974, utcOffset: -5 }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;

		expect(latitudeInput).toHaveAttribute('readonly');
		expect(longitudeInput).toHaveAttribute('readonly');
		expect(utcOffsetInput).toHaveAttribute('readonly');
	});

	it('has placeholder text for empty fields', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;

		expect(latitudeInput).toHaveAttribute('placeholder', 'Auto-filled');
		expect(longitudeInput).toHaveAttribute('placeholder', 'Auto-filled');
		expect(utcOffsetInput).toHaveAttribute('placeholder', 'Auto-filled');
	});

	it('handles decimal UTC offsets', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: null, utcOffset: 5.5 }
		});

		const utcOffsetInput = screen.getByLabelText('UTC Offset') as HTMLInputElement;
		expect(utcOffsetInput.value).toBe('UTC +5.5');
	});

	it('truncates latitude with more than 6 decimal places', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.71277612345, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		expect(latitudeInput.value).toBe('40.712776');
	});

	it('pads latitude with fewer decimal places to 6 digits', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 40.7, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		expect(latitudeInput.value).toBe('40.700000');
	});

	it('handles very large positive latitude', () => {
		render(CoordinatesDisplay, {
			props: { latitude: 85.123456, longitude: null, utcOffset: null }
		});

		const latitudeInput = screen.getByLabelText('Latitude') as HTMLInputElement;
		expect(latitudeInput.value).toBe('85.123456');
	});

	it('handles very large negative longitude', () => {
		render(CoordinatesDisplay, {
			props: { latitude: null, longitude: -179.999999, utcOffset: null }
		});

		const longitudeInput = screen.getByLabelText('Longitude') as HTMLInputElement;
		expect(longitudeInput.value).toBe('-179.999999');
	});
});
