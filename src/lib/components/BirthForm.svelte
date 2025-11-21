<script lang="ts">
	import { Card, Block, ListInput, Button, BlockTitle } from 'konsta/svelte';
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

<div class="max-w-2xl mx-auto">
	<Card outline raised class="overflow-hidden">
		{#snippet header()}
			<div class="px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
				<h1 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
					Birth Chart Calculator
				</h1>
				<p class="text-base text-gray-600 dark:text-gray-400">
					Discover your cosmic blueprint
				</p>
			</div>
		{/snippet}

		<div class="p-8 space-y-6">
			<!-- Personal Information -->
			<div class="space-y-5">
				<ListInput
					label="Name"
					type="text"
					placeholder="Enter your name"
					bind:value={formData.name}
					outline
					floatingLabel
					clearButton
					class="mb-4"
				/>

				<ListInput
					label="Date of Birth"
					type="date"
					bind:value={formData.dateOfBirth}
					outline
					floatingLabel
					error={!!errors.dateOfBirth}
					class="mb-4"
				/>

				<ListInput
					label="Time of Birth"
					type="time"
					bind:value={formData.timeOfBirth}
					outline
					floatingLabel
					error={!!errors.timeOfBirth}
					class="mb-4"
				/>
			</div>

			<!-- Place of Birth Section -->
			<div>
				<BlockTitle class="!text-lg !font-semibold !text-gray-900 dark:!text-white !mb-3">
					Place of Birth
				</BlockTitle>
				<PlaceAutocomplete
					bind:value={formData.placeOfBirth}
					error={errors.placeOfBirth}
					onselect={handlePlaceSelect}
					onerror={handlePlaceError}
				/>
			</div>

			<!-- API Error -->
			{#if apiError}
				<div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p class="text-sm text-red-700 dark:text-red-400">{apiError}</p>
				</div>
			{/if}

			<!-- Coordinates Section -->
			{#if formData.latitude && formData.longitude}
				<div>
					<BlockTitle class="!text-lg !font-semibold !text-gray-900 dark:!text-white !mb-3">
						Coordinates (Auto-filled)
					</BlockTitle>
					<CoordinatesDisplay
						latitude={formData.latitude}
						longitude={formData.longitude}
						utcOffset={formData.utcOffset}
					/>
				</div>
			{/if}

			<!-- Submit Button -->
			<Button
				large
				onClick={handleSubmit}
				class="w-full !bg-indigo-600 dark:!bg-indigo-500 hover:!bg-indigo-700 dark:hover:!bg-indigo-600 !text-white !font-semibold !py-4 !rounded-lg !shadow-md hover:!shadow-lg !transition-all !duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
			>
				Generate Birth Chart
			</Button>

			<p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
				Your privacy is protected. Data is processed locally.
			</p>
		</div>
	</Card>
</div>
