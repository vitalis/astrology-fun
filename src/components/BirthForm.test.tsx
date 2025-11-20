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

  it('renders form header', () => {
    render(<BirthForm />);
    expect(screen.getByText(/birth chart calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/discover your cosmic blueprint/i)).toBeInTheDocument();
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

  it('renders submit button', () => {
    render(<BirthForm />);
    expect(screen.getByRole('button', { name: /generate birth chart/i })).toBeInTheDocument();
  });

  it('allows user to fill in the name field', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });

  it('allows user to type in place field', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'New York');

    expect(placeInput).toHaveValue('New York');
  });

  it('does not call fetch for less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<BirthForm />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'Ne');

    // Wait a bit to ensure debounce would have fired
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(global.fetch).not.toHaveBeenCalled();
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

  it('name field is marked as optional', () => {
    render(<BirthForm />);

    const nameLabel = screen.getByText(/name/i);
    expect(nameLabel.textContent).toMatch(/optional/i);
  });

  it('required fields are marked with asterisk', () => {
    render(<BirthForm />);

    const labels = screen.getAllByText('*');
    expect(labels.length).toBeGreaterThanOrEqual(3); // At least 3 required fields
  });

  it('displays privacy notice', () => {
    render(<BirthForm />);

    expect(screen.getByText(/your privacy is protected/i)).toBeInTheDocument();
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

  it('submit button has proper content', () => {
    render(<BirthForm />);

    const submitButton = screen.getByRole('button', { name: /generate birth chart/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.textContent).toContain('Generate Birth Chart');
  });
});
