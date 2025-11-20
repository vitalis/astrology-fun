<script lang="ts">
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

	// Form data
	let formData: BirthFormData = {
		name: '',
		dateOfBirth: '',
		timeOfBirth: '',
		placeOfBirth: '',
		latitude: null,
		longitude: null,
		utcOffset: null
	};

	// Form validation errors
	let errors: Partial<Record<keyof BirthFormData, string>> = {};

	// Place suggestions state
	let placeSuggestions: PlaceSuggestion[] = [];
	let showSuggestions = false;
	let isLoadingSuggestions = false;
	let apiError: string | null = null;
	let abortController: AbortController | null = null;
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Reactive statement to fetch place suggestions when placeOfBirth changes
	$: {
		if (!formData.placeOfBirth || formData.placeOfBirth.length < 3) {
			placeSuggestions = [];
			showSuggestions = false;
			apiError = null;
		} else {
			// Debounce the API call
			if (debounceTimeout) clearTimeout(debounceTimeout);
			if (abortController) abortController.abort();

			debounceTimeout = setTimeout(async () => {
				abortController = new AbortController();
				isLoadingSuggestions = true;
				apiError = null;

				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
							formData.placeOfBirth
						)}&limit=5&addressdetails=1`,
						{
							headers: {
								'User-Agent': 'Astrology-Fun-App/1.0 (Birth Chart Calculator)'
							},
							signal: abortController.signal
						}
					);

					if (!response.ok) {
						throw new Error(`API returned ${response.status}`);
					}

					const data = await response.json();
					placeSuggestions = data;
					showSuggestions = true;
				} catch (error) {
					if (error instanceof Error && error.name === 'AbortError') {
						return;
					}
					console.error('Error fetching place suggestions:', error);
					apiError = 'Unable to fetch locations. Please try again.';
					placeSuggestions = [];
				} finally {
					isLoadingSuggestions = false;
				}
			}, 500);
		}
	}

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

	async function selectPlace(place: PlaceSuggestion) {
		const lat = parseFloat(place.lat);
		const lon = parseFloat(place.lon);

		formData.placeOfBirth = place.display_name;
		formData.latitude = lat;
		formData.longitude = lon;
		showSuggestions = false;
		placeSuggestions = [];

		isLoadingSuggestions = true;
		apiError = null;
		try {
			const offset = await fetchUTCOffset(lat, lon);
			formData.utcOffset = offset;
		} catch (error) {
			console.error('Error setting UTC offset:', error);
			apiError = 'Could not fetch timezone. Please try selecting the location again.';
		} finally {
			isLoadingSuggestions = false;
		}
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
		<!-- Header with clean typography -->
		<div
			class="px-4 sm:px-6 py-6 sm:py-8 text-center border-b border-gray-200 dark:border-gray-700"
		>
			<h1 class="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
				Birth Chart Calculator
			</h1>
			<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
				Discover your cosmic blueprint
			</p>
		</div>

		<!-- Form - Responsive padding and spacing -->
		<form on:submit={handleSubmit} class="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
			<!-- Name Field -->
			<div>
				<label
					for="name"
					class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Name <span class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-normal"
						>(optional)</span
					>
				</label>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
					placeholder="Enter your name"
				/>
			</div>

			<!-- Date of Birth -->
			<div>
				<label
					for="dateOfBirth"
					class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Date of Birth <span class="text-red-500 dark:text-red-400">*</span>
				</label>
				<input
					id="dateOfBirth"
					type="date"
					bind:value={formData.dateOfBirth}
					class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
				/>
				{#if errors.dateOfBirth}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>
				{/if}
			</div>

			<!-- Time of Birth -->
			<div>
				<label
					for="timeOfBirth"
					class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Time of Birth <span class="text-red-500 dark:text-red-400">*</span>
				</label>
				<input
					id="timeOfBirth"
					type="time"
					step="60"
					bind:value={formData.timeOfBirth}
					class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
				/>
				{#if errors.timeOfBirth}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">{errors.timeOfBirth}</p>
				{/if}
			</div>

			<!-- Place of Birth with Autocomplete -->
			<div class="relative">
				<label
					for="placeOfBirth"
					class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Place of Birth <span class="text-red-500 dark:text-red-400">*</span>
				</label>
				<input
					id="placeOfBirth"
					type="text"
					bind:value={formData.placeOfBirth}
					class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
					placeholder="Start typing a city..."
					autocomplete="off"
				/>
				{#if errors.placeOfBirth}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">{errors.placeOfBirth}</p>
				{/if}

				<!-- Autocomplete Suggestions - Touch-optimized -->
				{#if showSuggestions}
					<div
						class="absolute z-20 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
					>
						{#if isLoadingSuggestions}
							<div
								class="px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base"
							>
								Searching...
							</div>
						{:else if placeSuggestions.length > 0}
							{#each placeSuggestions as place, index}
								<button
									type="button"
									on:click={() => selectPlace(place)}
									class="w-full text-left px-4 py-3 sm:py-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition border-b border-gray-200 dark:border-gray-600 last:border-b-0 min-h-[44px] sm:min-h-[48px]"
								>
									<div class="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
										{place.display_name}
									</div>
								</button>
							{/each}
						{:else}
							<div
								class="px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base"
							>
								No locations found
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- API Error -->
			{#if apiError}
				<div
					class="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
				>
					<p class="text-sm sm:text-base text-red-700 dark:text-red-400">{apiError}</p>
				</div>
			{/if}

			<!-- Coordinates Section -->
			<div
				class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 border border-gray-200 dark:border-gray-600"
			>
				<h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
					Coordinates (Auto-filled)
				</h3>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
					<div>
						<label
							for="latitude"
							class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5"
						>
							Latitude
						</label>
						<input
							id="latitude"
							type="text"
							value={formData.latitude !== null && formData.latitude !== undefined
								? formData.latitude.toFixed(6)
								: ''}
							readonly
							class="w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[40px]"
							placeholder="Auto-filled"
						/>
					</div>

					<div>
						<label
							for="longitude"
							class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5"
						>
							Longitude
						</label>
						<input
							id="longitude"
							type="text"
							value={formData.longitude !== null && formData.longitude !== undefined
								? formData.longitude.toFixed(6)
								: ''}
							readonly
							class="w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[40px]"
							placeholder="Auto-filled"
						/>
					</div>
				</div>

				<div>
					<label
						for="utcOffset"
						class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5"
					>
						UTC Offset
					</label>
					<input
						id="utcOffset"
						type="text"
						value={formData.utcOffset !== null && formData.utcOffset !== undefined
							? `UTC ${formData.utcOffset >= 0 ? '+' : ''}${formData.utcOffset}`
							: ''}
						readonly
						class="w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[40px]"
						placeholder="Auto-filled"
					/>
				</div>
			</div>

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
