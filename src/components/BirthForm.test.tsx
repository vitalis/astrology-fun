import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthForm from './BirthForm';

// Mock fetch for place autocomplete
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BirthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<BirthForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/utc offset/i)).toBeInTheDocument();
  });

  it('renders the header with title and description', () => {
    render(<BirthForm />);

    // Check for title by looking at the h1 element
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Birth Chart');
    expect(heading.textContent).toContain('Calculator');

    expect(screen.getByText(/discover the cosmic blueprint/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<BirthForm />);

    expect(screen.getByRole('button', { name: /generate birth chart/i })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const submitButton = screen.getByRole('button', { name: /generate birth chart/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/time of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/place of birth is required/i)).toBeInTheDocument();
    });
  });

  it('allows user to fill in the name field', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });

  it('allows user to select date and time', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const dateInput = screen.getByLabelText(/date of birth/i);
    const timeInput = screen.getByLabelText(/time of birth/i);

    await user.type(dateInput, '1990-05-15');
    await user.type(timeInput, '14:30');

    expect(dateInput).toHaveValue('1990-05-15');
    expect(timeInput).toHaveValue('14:30');
  });

  it('shows place suggestions when typing in place field', async () => {
    const user = userEvent.setup();
    const mockPlaces = [
      {
        display_name: 'New York, USA',
        lat: '40.7128',
        lon: '-74.0060',
        address: { city: 'New York', country: 'USA' },
      },
      {
        display_name: 'New York, UK',
        lat: '53.0792',
        lon: '-0.1417',
        address: { city: 'New York', country: 'UK' },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaces,
    });

    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'New York');

    await waitFor(() => {
      expect(screen.getByText(/📍 New York, USA/)).toBeInTheDocument();
      expect(screen.getByText(/📍 New York, UK/)).toBeInTheDocument();
    });
  });

  it('updates lat/lon/utc when place is selected', async () => {
    const user = userEvent.setup();
    const mockPlaces = [
      {
        display_name: 'New York, USA',
        lat: '40.7128',
        lon: '-74.0060',
        address: { city: 'New York', country: 'USA' },
      },
    ];

    // Mock Nominatim API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaces,
    });

    // Mock TimeAPI response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        currentUtcOffset: { offset: '-05:00' }
      }),
    });

    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'New York');

    await waitFor(() => {
      expect(screen.getByText(/📍 New York, USA/)).toBeInTheDocument();
    });

    const suggestion = screen.getByText(/📍 New York, USA/);
    await user.click(suggestion);

    await waitFor(() => {
      const latInput = screen.getByLabelText(/latitude/i);
      const lonInput = screen.getByLabelText(/longitude/i);
      const utcInput = screen.getByLabelText(/utc offset/i);

      expect(latInput).toHaveValue('40.712800');
      expect(lonInput).toHaveValue('-74.006000');
      expect(utcInput).toHaveValue('UTC -5');
    });
  });

  it('does not show suggestions for less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'Ne');

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('shows "No locations found" when no suggestions are returned', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'XYZ123');

    await waitFor(() => {
      expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
    });
  });

  it('lat/lon/utc fields are read-only', () => {
    render(<BirthForm />);

    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    const utcInput = screen.getByLabelText(/utc offset/i);

    expect(latInput).toHaveAttribute('readonly');
    expect(lonInput).toHaveAttribute('readonly');
    expect(utcInput).toHaveAttribute('readonly');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const mockPlaces = [
      {
        display_name: 'London, UK',
        lat: '51.5074',
        lon: '-0.1278',
        address: { city: 'London', country: 'UK' },
      },
    ];

    // Mock Nominatim API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaces,
    });

    // Mock TimeAPI response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        currentUtcOffset: { offset: '-00:00' }
      }),
    });

    render(<BirthForm />);

    // Fill in all required fields
    await user.type(screen.getByLabelText(/name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/date of birth/i), '1985-03-20');
    await user.type(screen.getByLabelText(/time of birth/i), '08:45');

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'London');

    await waitFor(() => {
      expect(screen.getByText(/📍 London, UK/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/📍 London, UK/));

    // Wait for timezone to be loaded
    await waitFor(() => {
      const utcInput = screen.getByLabelText(/utc offset/i);
      expect(utcInput).toHaveValue('UTC +0');
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate birth chart/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it('name field is marked as optional', () => {
    render(<BirthForm />);

    const nameLabel = screen.getByText(/name/i);
    expect(nameLabel.textContent).toMatch(/optional/i);
  });

  it('required fields are marked with asterisk', () => {
    render(<BirthForm />);

    // Check that required fields have asterisks
    const labels = screen.getAllByText('*');
    expect(labels.length).toBeGreaterThanOrEqual(3); // At least 3 required fields
  });
});
