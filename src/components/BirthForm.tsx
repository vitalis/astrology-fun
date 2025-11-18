import { useState, useEffect } from 'react';
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
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const placeOfBirth = watch('placeOfBirth');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const utcOffset = watch('utcOffset');

  // Fetch place suggestions from Nominatim API
  useEffect(() => {
    if (!placeOfBirth || placeOfBirth.length < 3) {
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const timeout = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            placeOfBirth
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setPlaceSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
        setPlaceSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500); // Debounce for 500ms

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [placeOfBirth]);

  // Calculate UTC offset based on latitude and longitude
  const calculateUTCOffset = (_lat: number, lon: number): number => {
    // Simple approximation: UTC offset = longitude / 15
    // This is a rough estimate; for production, use a timezone API
    const offset = Math.round(lon / 15);
    return offset;
  };

  const selectPlace = (place: PlaceSuggestion) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const offset = calculateUTCOffset(lat, lon);

    setValue('placeOfBirth', place.display_name);
    setValue('latitude', lat);
    setValue('longitude', lon);
    setValue('utcOffset', offset);
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  const onSubmit = (data: BirthFormData) => {
    console.log('Form submitted:', data);
    alert(`Birth Chart Data:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            ✨ Birth Chart Calculator
          </h1>
          <p className="text-gray-600">Enter your birth details to generate your astrological chart</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field (Optional) */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
              placeholder="Enter your name"
            />
          </div>

          {/* Date of Birth (Required) */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Time of Birth (Required) */}
          <div>
            <label htmlFor="timeOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
              Time of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="timeOfBirth"
              type="time"
              step="60"
              {...register('timeOfBirth', { required: 'Time of birth is required' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
            />
            {errors.timeOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.timeOfBirth.message}</p>
            )}
          </div>

          {/* Place of Birth with Autocomplete (Required) */}
          <div className="relative">
            <label htmlFor="placeOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
              Place of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="placeOfBirth"
              type="text"
              {...register('placeOfBirth', { required: 'Place of birth is required' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
              placeholder="Start typing a city or location..."
              autoComplete="off"
            />
            {errors.placeOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.placeOfBirth.message}</p>
            )}

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                    <span className="ml-2">Searching...</span>
                  </div>
                ) : placeSuggestions.length > 0 ? (
                  placeSuggestions.map((place, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPlace(place)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{place.display_name}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No locations found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Latitude (Read-only) */}
          <div>
            <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700 mb-2">
              Latitude
            </label>
            <input
              id="latitude"
              type="text"
              value={latitude !== null && latitude !== undefined ? latitude.toFixed(6) : ''}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Auto-filled when place is selected"
            />
          </div>

          {/* Longitude (Read-only) */}
          <div>
            <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700 mb-2">
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              value={longitude !== null && longitude !== undefined ? longitude.toFixed(6) : ''}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Auto-filled when place is selected"
            />
          </div>

          {/* UTC Offset (Read-only) */}
          <div>
            <label htmlFor="utcOffset" className="block text-sm font-semibold text-gray-700 mb-2">
              UTC Offset
            </label>
            <input
              id="utcOffset"
              type="text"
              value={utcOffset !== null && utcOffset !== undefined ? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}` : ''}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Auto-filled when place is selected"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Generate Birth Chart ✨
          </button>
        </form>
      </div>
    </div>
  );
}
