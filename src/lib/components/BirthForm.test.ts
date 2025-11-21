import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BirthForm from './BirthForm.svelte';

type MockFetch = ReturnType<typeof vi.fn>;

// Mock fetch
global.fetch = vi.fn() as MockFetch;

describe('BirthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as MockFetch).mockReset();
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
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getAllByText(/place of birth/i).length).toBeGreaterThan(0); // Appears in section title and input label
  });

  it('renders submit button', () => {
    render(BirthForm);
    expect(screen.getByRole('button', { name: /generate birth chart/i })).toBeInTheDocument();
  });

  it('allows user to fill in the name field', async () => {
    const user = userEvent.setup();
    render(BirthForm);

    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });

  it('does not call fetch for less than 3 characters', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(BirthForm);

    const placeInput = screen.getByPlaceholderText(/start typing a city/i);
    await user.type(placeInput, 'NY');

    // Advance timers past debounce
    await vi.advanceTimersByTimeAsync(600);

    expect(global.fetch).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('allows user to type in place field', async () => {
    const user = userEvent.setup();
    render(BirthForm);

    const placeInput = screen.getByPlaceholderText(/start typing a city/i);
    await user.type(placeInput, 'London');

    expect(placeInput).toHaveValue('London');
  });

  it('lat/lon/utc fields are displayed as text (read-only)', () => {
    // Note: Coordinates are now displayed in CoordinatesDisplay component
    // which doesn't use input fields - it displays text values
    // This test just verifies the component structure is correct
    const { container } = render(BirthForm);

    // Verify no lat/lon/utc input fields exist by default (they appear after place selection)
    const inputs = container.querySelectorAll('input');
    const inputTypes = Array.from(inputs).map((input: any) => input.type);

    // Should only have text, date, and time inputs initially
    expect(inputTypes.every((type: string) => ['text', 'date', 'time'].includes(type))).toBe(true);
  });

  it('name field accepts input', () => {
    render(BirthForm);
    const nameInput = screen.getByPlaceholderText(/enter your name/i) as HTMLInputElement;
    // Name field should accept text input
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.type).toBe('text');
  });

  it('displays privacy notice', () => {
    render(BirthForm);
    expect(screen.getByText(/your privacy is protected/i)).toBeInTheDocument();
  });

  it('has proper card structure', () => {
    const { container } = render(BirthForm);
    // Verify Card component is rendered
    const card = container.querySelector('.k-card');
    expect(card).toBeInTheDocument();
  });

  it('submit button has proper content', () => {
    render(BirthForm);
    const button = screen.getByRole('button', { name: /generate birth chart/i });
    expect(button).toHaveTextContent(/generate birth chart/i);
  });
});
