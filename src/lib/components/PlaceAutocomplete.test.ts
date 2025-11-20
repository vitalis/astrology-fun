import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PlaceAutocomplete from './PlaceAutocomplete.svelte';

describe('PlaceAutocomplete', () => {
	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders the label and input', () => {
		render(PlaceAutocomplete, { props: { value: '' } });
		expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/start typing a city/i)).toBeInTheDocument();
	});

	it('renders with initial value', () => {
		render(PlaceAutocomplete, { props: { value: 'New York' } });
		const input = screen.getByLabelText(/place of birth/i) as HTMLInputElement;
		expect(input.value).toBe('New York');
	});

	it('displays error message when error prop is provided', () => {
		render(PlaceAutocomplete, { props: { value: '', error: 'This field is required' } });
		expect(screen.getByText('This field is required')).toBeInTheDocument();
	});

	it('allows user to type in the input', async () => {
		const user = userEvent.setup();
		render(PlaceAutocomplete, { props: { value: '' } });
		const input = screen.getByLabelText(/place of birth/i);

		await user.type(input, 'London');
		expect(input).toHaveValue('London');
	});

	it('does not fetch suggestions for less than 3 characters', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });
		render(PlaceAutocomplete, { props: { value: '' } });
		const input = screen.getByLabelText(/place of birth/i);

		await user.type(input, 'NY');
		await vi.advanceTimersByTimeAsync(600);

		expect(global.fetch).not.toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('debounces API calls and fetches suggestions after 500ms', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		const mockResponse = [
			{
				display_name: 'New York, USA',
				lat: '40.7128',
				lon: '-74.0060',
				address: { city: 'New York', country: 'USA' }
			}
		];

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse
		});

		render(PlaceAutocomplete, { props: { value: '' } });
		const input = screen.getByLabelText(/place of birth/i);

		await user.type(input, 'New York');

		// Should not call immediately
		expect(global.fetch).not.toHaveBeenCalled();

		// Should call after 500ms debounce
		await vi.advanceTimersByTimeAsync(500);

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('https://nominatim.openstreetmap.org/search'),
			expect.objectContaining({
				headers: {
					'User-Agent': 'Astrology-Fun-App/1.0 (Birth Chart Calculator)'
				}
			})
		);

		vi.useRealTimers();
	});

	it('displays suggestions when fetch is successful', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		const mockResponse = [
			{
				display_name: 'London, UK',
				lat: '51.5074',
				lon: '-0.1278',
				address: { city: 'London', country: 'UK' }
			},
			{
				display_name: 'London, Ontario, Canada',
				lat: '42.9849',
				lon: '-81.2453',
				address: { city: 'London', state: 'Ontario', country: 'Canada' }
			}
		];

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse
		});

		render(PlaceAutocomplete, { props: { value: '' } });
		const input = screen.getByLabelText(/place of birth/i);

		await user.type(input, 'London');
		await vi.advanceTimersByTimeAsync(500);

		await waitFor(() => {
			expect(screen.getByText('London, UK')).toBeInTheDocument();
			expect(screen.getByText('London, Ontario, Canada')).toBeInTheDocument();
		});

		vi.useRealTimers();
	});

	it('displays "No locations found" when API returns empty array', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => []
		});

		render(PlaceAutocomplete, { props: { value: '' } });
		const input = screen.getByLabelText(/place of birth/i);

		await user.type(input, 'XYZ123');
		await vi.advanceTimersByTimeAsync(500);

		await waitFor(() => {
			expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
		});

		vi.useRealTimers();
	});

	it('calls onselect callback when a suggestion is clicked', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		const mockResponse = [
			{
				display_name: 'Paris, France',
				lat: '48.8566',
				lon: '2.3522',
				address: { city: 'Paris', country: 'France' }
			}
		];

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse
		});

		// Track the select event
		const onselect = vi.fn();

		render(PlaceAutocomplete, { props: { value: '', onselect } });

		const input = screen.getByLabelText(/place of birth/i);
		await user.type(input, 'Paris');
		await vi.advanceTimersByTimeAsync(500);

		await waitFor(() => {
			expect(screen.getByText('Paris, France')).toBeInTheDocument();
		});

		const suggestion = screen.getByText('Paris, France');
		await user.click(suggestion);

		expect(onselect).toHaveBeenCalledWith({
			latitude: 48.8566,
			longitude: 2.3522,
			displayName: 'Paris, France'
		});

		// Input should be updated with the selected value
		expect(input).toHaveValue('Paris, France');

		// Suggestions should be hidden
		expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();

		vi.useRealTimers();
	});

	it('calls onerror callback when fetch fails', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

		// Track the error event
		const onerror = vi.fn();

		render(PlaceAutocomplete, { props: { value: '', onerror } });

		const input = screen.getByLabelText(/place of birth/i);
		await user.type(input, 'Test');
		await vi.advanceTimersByTimeAsync(500);

		await waitFor(() => {
			expect(onerror).toHaveBeenCalledWith('Unable to fetch locations. Please try again.');
		});

		vi.useRealTimers();
	});

	it('calls onerror callback for non-ok response from API', async () => {
		vi.useFakeTimers();
		const user = userEvent.setup({ delay: null });

		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 500
		});

		// Track the error event
		const onerror = vi.fn();

		render(PlaceAutocomplete, { props: { value: '', onerror } });

		const input = screen.getByLabelText(/place of birth/i);
		await user.type(input, 'Test');
		await vi.advanceTimersByTimeAsync(500);

		await waitFor(() => {
			expect(onerror).toHaveBeenCalledWith('Unable to fetch locations. Please try again.');
		});

		vi.useRealTimers();
	});

});
