<script lang="ts">
	import { Block, List, ListInput, Button, BlockTitle } from 'konsta/svelte';
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
			console.error('UTC offset fetch error:', error);
			throw error;
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

<Block class="space-y-4" strong inset>
	<!-- Personal Information -->
	<List>
		<ListInput
			label="Name"
			type="text"
			placeholder="Enter your name"
			bind:value={formData.name}
			floatingLabel
			clearButton
		/>

		<ListInput
			label="Date of Birth"
			type="date"
			bind:value={formData.dateOfBirth}
			floatingLabel
			error={errors.dateOfBirth}
			errorMessage={errors.dateOfBirth}
		/>

		<ListInput
			label="Time of Birth"
			type="time"
			bind:value={formData.timeOfBirth}
			floatingLabel
			error={errors.timeOfBirth}
			errorMessage={errors.timeOfBirth}
		/>
	</List>

	<!-- Place of Birth Section -->
	<BlockTitle>Place of Birth</BlockTitle>
	<PlaceAutocomplete
		bind:value={formData.placeOfBirth}
		error={errors.placeOfBirth}
		onselect={handlePlaceSelect}
		onerror={handlePlaceError}
	/>

	<!-- API Error -->
	{#if apiError}
		<Block class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
			<p class="text-sm">{apiError}</p>
		</Block>
	{/if}

	<!-- Coordinates Section -->
	{#if formData.latitude && formData.longitude}
		<BlockTitle>Coordinates (Auto-filled)</BlockTitle>
		<CoordinatesDisplay
			latitude={formData.latitude}
			longitude={formData.longitude}
			utcOffset={formData.utcOffset}
		/>
	{/if}

	<!-- Submit Button -->
	<Button
		large
		onClick={handleSubmit}
		class="k-color-brand-primary"
	>
		Generate Birth Chart
	</Button>

	<Block class="text-center">
		<p class="text-xs text-gray-600 dark:text-gray-400">
			Your privacy is protected. Data is processed locally.
		</p>
	</Block>
</Block>
