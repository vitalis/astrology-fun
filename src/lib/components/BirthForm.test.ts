import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BirthForm from './BirthForm.svelte';

// Mock fetch
global.fetch = vi.fn();

describe('BirthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders form header', () => {
    render(BirthForm);
    expect(screen.getByText(/birth chart calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/discover your cosmic blueprint/i)).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(BirthForm);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(BirthForm);
    expect(screen.getByRole('button', { name: /generate birth chart/i })).toBeInTheDocument();
  });

  it('allows user to fill in the name field', async () => {
    const user = userEvent.setup();
    render(BirthForm);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });

  it('does not call fetch for less than 3 characters', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(BirthForm);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'NY');

    // Advance timers past debounce
    await vi.advanceTimersByTimeAsync(600);

    expect(global.fetch).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('allows user to type in place field', async () => {
    const user = userEvent.setup();
    render(BirthForm);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await user.type(placeInput, 'London');

    expect(placeInput).toHaveValue('London');
  });

  it('lat/lon/utc fields are read-only', () => {
    render(BirthForm);

    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    const utcInput = screen.getByLabelText(/utc offset/i);

    expect(latInput).toHaveAttribute('readonly');
    expect(lonInput).toHaveAttribute('readonly');
    expect(utcInput).toHaveAttribute('readonly');
  });

  it('name field is marked as optional', () => {
    render(BirthForm);
    expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument();
  });

  it('required fields are marked with asterisk', () => {
    render(BirthForm);
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it('displays privacy notice', () => {
    render(BirthForm);
    expect(screen.getByText(/your privacy is protected/i)).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    render(BirthForm);
    const form = screen.getByRole('button', { name: /generate birth chart/i }).closest('form');
    expect(form).toBeInTheDocument();
  });

  it('submit button has proper content', () => {
    render(BirthForm);
    const button = screen.getByRole('button', { name: /generate birth chart/i });
    expect(button).toHaveTextContent(/generate birth chart/i);
  });
});
