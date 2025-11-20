<script lang="ts">
	import BirthFormHeader from './BirthFormHeader.svelte';
	import FormInput from './FormInput.svelte';
	import PlaceAutocomplete from './PlaceAutocomplete.svelte';
	import CoordinatesDisplay from './CoordinatesDisplay.svelte';

	interface BirthFormData {
		name: string;
		dateOfBirth: string;
		timeOfBirth: string;
		placeOfBirth: string;
		latitude: number | null;
		longitude: number | null;
		utcOffset: number | null;
	}

	// Form data
	let formData: BirthFormData = $state({
		name: '',
		dateOfBirth: '',
		timeOfBirth: '',
		placeOfBirth: '',
		latitude: null,
		longitude: null,
		utcOffset: null
	});

	// Form validation errors
	let errors: Partial<Record<keyof BirthFormData, string>> = $state({});

	// API error state
	let apiError: string | null = $state(null);
	let isLoadingTimezone = $state(false);

	async function fetchUTCOffset(lat: number, lon: number): Promise<number> {
		try {
			const response = await fetch(
				`https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`,
				{
					headers: {
						Accept: 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error('Timezone API failed');
			}

			const data = await response.json();

			if (data.currentUtcOffset) {
				const offsetString = data.currentUtcOffset.offset || data.currentUtcOffset;
				const [hours, minutes] = offsetString.replace('+', '').split(':').map(Number);
				const offsetHours = hours + minutes / 60;
				return offsetHours;
			}

			throw new Error('Invalid timezone data');
		} catch (error) {
			console.error('Error fetching timezone:', error);
			const offset = Math.round(lon / 15);
			return offset;
		}
	}

	async function handlePlaceSelect(data: {
		latitude: number;
		longitude: number;
		displayName: string;
	}) {
		const { latitude, longitude, displayName } = data;

		formData.placeOfBirth = displayName;
		formData.latitude = latitude;
		formData.longitude = longitude;

		isLoadingTimezone = true;
		apiError = null;
		try {
			const offset = await fetchUTCOffset(latitude, longitude);
			formData.utcOffset = offset;
		} catch (error) {
			console.error('Error setting UTC offset:', error);
			apiError = 'Could not fetch timezone. Please try selecting the location again.';
		} finally {
			isLoadingTimezone = false;
		}
	}

	function handlePlaceError(error: string) {
		apiError = error;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		errors = {};

		// Validate required fields
		if (!formData.dateOfBirth) {
			errors.dateOfBirth = 'Date of birth is required';
		}
		if (!formData.timeOfBirth) {
			errors.timeOfBirth = 'Time of birth is required';
		}
		if (!formData.placeOfBirth) {
			errors.placeOfBirth = 'Place of birth is required';
		}

		// Validate location data
		if (
			formData.latitude === null ||
			formData.longitude === null ||
			formData.utcOffset === null
		) {
			apiError =
				'Please select a location from the suggestions to auto-fill coordinates and timezone.';
			return;
		}

		// Check if there are any errors
		if (Object.keys(errors).length > 0) {
			return;
		}

		// Clear any errors
		apiError = null;

		console.log('Form submitted:', formData);
		alert(`Birth Chart Data:\n${JSON.stringify(formData, null, 2)}`);
	}
</script>

<div class="max-w-2xl mx-auto">
	<!-- Clean Card with theme support -->
	<div
		class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
	>
		<BirthFormHeader />

		<!-- Form - Responsive padding and spacing -->
		<form onsubmit={handleSubmit} class="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
			<!-- Name Field -->
			<FormInput
				id="name"
				label="Name"
				bind:value={formData.name}
				placeholder="Enter your name"
			/>

			<!-- Date of Birth -->
			<FormInput
				id="dateOfBirth"
				label="Date of Birth"
				type="date"
				required
				bind:value={formData.dateOfBirth}
				error={errors.dateOfBirth}
			/>

			<!-- Time of Birth -->
			<FormInput
				id="timeOfBirth"
				label="Time of Birth"
				type="time"
				step="60"
				required
				bind:value={formData.timeOfBirth}
				error={errors.timeOfBirth}
			/>

			<!-- Place of Birth with Autocomplete -->
			<PlaceAutocomplete
				bind:value={formData.placeOfBirth}
				error={errors.placeOfBirth}
				onselect={handlePlaceSelect}
				onerror={handlePlaceError}
			/>

			<!-- API Error -->
			{#if apiError}
				<div
					class="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
				>
					<p class="text-sm sm:text-base text-red-700 dark:text-red-400">{apiError}</p>
				</div>
			{/if}

			<!-- Coordinates Section -->
			<CoordinatesDisplay
				latitude={formData.latitude}
				longitude={formData.longitude}
				utcOffset={formData.utcOffset}
			/>

			<!-- Submit Button -->
			<button
				type="submit"
				class="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3.5 sm:py-4 px-6 text-base sm:text-lg rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] min-h-[48px] sm:min-h-[52px] shadow-md hover:shadow-lg"
			>
				Generate Birth Chart
			</button>

			<p class="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
				Your privacy is protected. Data is processed locally.
			</p>
		</form>
	</div>
</div>
