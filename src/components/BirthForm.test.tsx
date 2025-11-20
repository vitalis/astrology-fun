import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthForm from './BirthForm';

// Mock window.alert
vi.stubGlobal('alert', vi.fn());

// Mock fetch for place autocomplete
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BirthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<BirthForm />);

    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Time of Birth')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/start typing a city/i)).toBeInTheDocument();
    expect(screen.getByText('Latitude')).toBeInTheDocument();
    expect(screen.getByText('Longitude')).toBeInTheDocument();
    expect(screen.getByText('UTC Offset')).toBeInTheDocument();
  });

  it('renders the header with title and subtitle', () => {
    render(<BirthForm />);

    expect(screen.getByText('Birth Chart')).toBeInTheDocument();
    expect(screen.getByText('Calculate Your Cosmic Blueprint')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<BirthForm />);

    expect(screen.getByRole('button', { name: /generate birth chart/i })).toBeInTheDocument();
  });

  it('allows user to fill in the name field', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });

  it('allows user to type in place field', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const placeInput = screen.getByPlaceholderText(/start typing a city/i);
    await user.type(placeInput, 'New York');

    expect(placeInput).toHaveValue('New York');
  });

  it('does not call fetch for less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const placeInput = screen.getByPlaceholderText(/start typing a city/i);
    await user.type(placeInput, 'Ne');

    // Wait a bit to ensure debounce would have fired
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('lat/lon/utc fields are read-only and disabled', () => {
    render(<BirthForm />);

    // Check for readonly inputs in the coordinate section
    const readonlyInputs = document.querySelectorAll('input[readonly]');
    expect(readonlyInputs.length).toBeGreaterThanOrEqual(3);

    // Verify they have the disabled attribute too (Konsta UI pattern)
    const disabledInputs = document.querySelectorAll('input[disabled]');
    expect(disabledInputs.length).toBeGreaterThanOrEqual(3);
  });

  it('name field is marked as optional in placeholder', () => {
    render(<BirthForm />);

    const nameInput = screen.getByPlaceholderText(/enter your name \(optional\)/i);
    expect(nameInput).toBeInTheDocument();
  });

  it('renders section titles correctly', () => {
    render(<BirthForm />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Birth Location')).toBeInTheDocument();
    expect(screen.getByText(/Coordinates.*Auto-filled/i)).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    render(<BirthForm />);

    // Check that form exists
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    // Check that all required name attributes exist
    expect(document.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="dateOfBirth"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="timeOfBirth"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="placeOfBirth"]')).toBeInTheDocument();
  });

  it('displays privacy notice', () => {
    render(<BirthForm />);

    expect(screen.getByText(/your privacy is protected/i)).toBeInTheDocument();
  });

  it('submit button has proper styling and content', () => {
    render(<BirthForm />);

    const submitButton = screen.getByRole('button', { name: /generate birth chart/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.textContent).toContain('Generate Birth Chart');
    expect(submitButton.textContent).toContain('✨');
  });
});
