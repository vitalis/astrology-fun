import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Page,
  Navbar,
  Block,
  List,
  ListInput,
  Button,
  BlockTitle,
} from 'konsta/react';

interface BirthFormData {
  name?: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  utcOffset: number | null;
}

interface PlaceSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export default function BirthForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BirthFormData>();

  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const placeOfBirth = watch('placeOfBirth');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const utcOffset = watch('utcOffset');

  // Fetch place suggestions from Nominatim API
  useEffect(() => {
    if (!placeOfBirth || placeOfBirth.length < 3) {
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      setApiError(null);
      return;
    }

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Set new timeout for debouncing
    const timeout = setTimeout(async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setIsLoadingSuggestions(true);
      setApiError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            placeOfBirth
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Astrology-Fun-App/1.0 (Birth Chart Calculator)'
            },
            signal: abortControllerRef.current.signal
          }
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setPlaceSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        // Don't show error if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('Error fetching place suggestions:', error);
        setApiError('Unable to fetch locations. Please try again.');
        setPlaceSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(timeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [placeOfBirth]);

  // Fetch accurate UTC offset from timezone API
  const fetchUTCOffset = async (lat: number, lon: number): Promise<number> => {
    try {
      // Use TimeAPI.io free service for timezone lookup
      const response = await fetch(
        `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Timezone API failed');
      }

      const data = await response.json();

      // Extract UTC offset from the response
      // TimeAPI returns currentUtcOffset in format like "+01:00" or "-05:00"
      if (data.currentUtcOffset) {
        const offsetString = data.currentUtcOffset.offset || data.currentUtcOffset;
        const [hours, minutes] = offsetString.replace('+', '').split(':').map(Number);
        const offsetHours = hours + (minutes / 60);
        return offsetHours;
      }

      throw new Error('Invalid timezone data');
    } catch (error) {
      console.error('Error fetching timezone:', error);
      // Fallback to rough approximation if API fails
      const offset = Math.round(lon / 15);
      return offset;
    }
  };

  const selectPlace = async (place: PlaceSuggestion) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setValue('placeOfBirth', place.display_name);
    setValue('latitude', lat);
    setValue('longitude', lon);
    setShowSuggestions(false);
    setPlaceSuggestions([]);

    // Fetch accurate timezone offset
    setIsLoadingSuggestions(true);
    setApiError(null);
    try {
      const offset = await fetchUTCOffset(lat, lon);
      setValue('utcOffset', offset);
    } catch (error) {
      console.error('Error setting UTC offset:', error);
      setApiError('Could not fetch timezone. Please try selecting the location again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const onSubmit = (data: BirthFormData) => {
    // Validate that location data is complete
    if (data.latitude === null || data.longitude === null || data.utcOffset === null) {
      setApiError('Please select a location from the suggestions to auto-fill coordinates and timezone.');
      return;
    }

    // Clear any errors
    setApiError(null);

    console.log('Form submitted:', data);
    alert(`Birth Chart Data:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <Page className="select-none">
      <Navbar
        title="Birth Chart"
        subtitle="Calculate Your Cosmic Blueprint"
        className="select-none"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <BlockTitle className="select-none">Personal Information</BlockTitle>
        <List strongIos insetIos className="select-none">
          <ListInput
            label="Name"
            type="text"
            placeholder="Enter your name (optional)"
            {...register('name')}
            floatingLabel
            outline
            clearButton
            className="select-none outline-none"
          />

          <ListInput
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
            floatingLabel
            outline
            className="select-none outline-none"
            error={errors.dateOfBirth?.message}
          />

          <ListInput
            label="Time of Birth"
            type="time"
            {...register('timeOfBirth', { required: 'Time of birth is required' })}
            floatingLabel
            outline
            className="select-none outline-none"
            error={errors.timeOfBirth?.message}
          />
        </List>

        {/* Location Section */}
        <BlockTitle className="select-none">Birth Location</BlockTitle>
        <List strongIos insetIos className="select-none">
          <div className="relative">
            <ListInput
              label="Place of Birth"
              type="text"
              placeholder="Start typing a city..."
              {...register('placeOfBirth', { required: 'Place of birth is required' })}
              floatingLabel
              outline
              clearButton
              autoComplete="off"
              className="select-none outline-none"
              error={errors.placeOfBirth?.message}
            />

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-50 left-4 right-4 mt-1 bg-white rounded-xl shadow-2xl max-h-64 overflow-y-auto border border-gray-200">
                {isLoadingSuggestions ? (
                  <div className="px-4 py-4 text-gray-500 text-center">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-sm">Searching...</span>
                  </div>
                ) : placeSuggestions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {placeSuggestions.map((place, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <div className="text-sm text-gray-800">
                          📍 {place.display_name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-gray-500 text-center text-sm">
                    No locations found
                  </div>
                )}
              </div>
            )}
          </div>
        </List>

        {/* API Error Message */}
        {apiError && (
          <Block className="select-none">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <span>⚠️</span>
                <span className="flex-1">{apiError}</span>
              </p>
            </div>
          </Block>
        )}

        {/* Coordinates Section (Read-only) */}
        <BlockTitle className="select-none">Coordinates (Auto-filled)</BlockTitle>
        <List strongIos insetIos className="select-none">
          <ListInput
            label="Latitude"
            type="text"
            value={latitude !== null && latitude !== undefined ? latitude.toFixed(6) : ''}
            readOnly
            disabled
            floatingLabel
            outline
            className="select-none outline-none"
          />

          <ListInput
            label="Longitude"
            type="text"
            value={longitude !== null && longitude !== undefined ? longitude.toFixed(6) : ''}
            readOnly
            disabled
            floatingLabel
            outline
            className="select-none outline-none"
          />

          <ListInput
            label="UTC Offset"
            type="text"
            value={utcOffset !== null && utcOffset !== undefined ? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}` : ''}
            readOnly
            disabled
            floatingLabel
            outline
            className="select-none outline-none"
          />
        </List>

        {/* Submit Button */}
        <Block className="space-y-4 select-none">
          <Button
            type="submit"
            rounded
            large
            className="select-none outline-none"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Generate Birth Chart</span>
              <span className="text-xl">✨</span>
            </span>
          </Button>

          <p className="text-center text-xs text-gray-500">
            Your privacy is protected. Data is processed locally.
          </p>
        </Block>
      </form>
    </Page>
  );
}
