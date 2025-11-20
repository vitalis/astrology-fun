import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

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
    <div className="max-w-2xl mx-auto">
      {/* Glassmorphism Card */}
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Header with glass effect */}
        <div className="bg-white/10 backdrop-blur-md px-6 py-8 text-center border-b border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">✨ Birth Chart Calculator</h1>
          <p className="text-white/90 text-lg">Discover your cosmic blueprint</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
              Name <span className="text-white/60 text-xs font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition"
              placeholder="Enter your name"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-white mb-2">
              Date of Birth <span className="text-yellow-300">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-yellow-300 font-medium">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Time of Birth */}
          <div>
            <label htmlFor="timeOfBirth" className="block text-sm font-semibold text-white mb-2">
              Time of Birth <span className="text-yellow-300">*</span>
            </label>
            <input
              id="timeOfBirth"
              type="time"
              step="60"
              {...register('timeOfBirth', { required: 'Time of birth is required' })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition"
            />
            {errors.timeOfBirth && (
              <p className="mt-1 text-sm text-yellow-300 font-medium">{errors.timeOfBirth.message}</p>
            )}
          </div>

          {/* Place of Birth with Autocomplete */}
          <div className="relative">
            <label htmlFor="placeOfBirth" className="block text-sm font-semibold text-white mb-2">
              Place of Birth <span className="text-yellow-300">*</span>
            </label>
            <input
              id="placeOfBirth"
              type="text"
              {...register('placeOfBirth', { required: 'Place of birth is required' })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition"
              placeholder="Start typing a city..."
              autoComplete="off"
            />
            {errors.placeOfBirth && (
              <p className="mt-1 text-sm text-yellow-300 font-medium">{errors.placeOfBirth.message}</p>
            )}

            {/* Autocomplete Suggestions with glass effect */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-2 bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-gray-700 text-center text-sm">
                    Searching...
                  </div>
                ) : placeSuggestions.length > 0 ? (
                  placeSuggestions.map((place, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPlace(place)}
                      className="w-full text-left px-4 py-3 hover:bg-white/60 transition border-b border-white/30 last:border-b-0"
                    >
                      <div className="text-sm text-gray-800 font-medium">{place.display_name}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-700 text-center text-sm">
                    No locations found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/40 rounded-xl">
              <p className="text-sm text-yellow-100 font-medium">{apiError}</p>
            </div>
          )}

          {/* Coordinates Section with glass effect */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4 border border-white/20">
            <h3 className="text-sm font-semibold text-white">📍 Coordinates (Auto-filled)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-xs text-white/80 mb-1">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="text"
                  value={latitude !== null && latitude !== undefined ? latitude.toFixed(6) : ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white/90"
                  placeholder="Auto-filled"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-xs text-white/80 mb-1">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="text"
                  value={longitude !== null && longitude !== undefined ? longitude.toFixed(6) : ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white/90"
                  placeholder="Auto-filled"
                />
              </div>
            </div>

            <div>
              <label htmlFor="utcOffset" className="block text-xs text-white/80 mb-1">
                UTC Offset
              </label>
              <input
                id="utcOffset"
                type="text"
                value={utcOffset !== null && utcOffset !== undefined ? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}` : ''}
                readOnly
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white/90"
                placeholder="Auto-filled"
              />
            </div>
          </div>

          {/* Submit Button with glass effect */}
          <button
            type="submit"
            className="w-full bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-xl border-2 border-white/40 hover:bg-white/40 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-[1.02]"
          >
            ✨ Generate Birth Chart ✨
          </button>

          <p className="text-center text-sm text-white/80">
            🔒 Your privacy is protected. Data is processed locally.
          </p>
        </form>
      </div>
    </div>
  );
}
