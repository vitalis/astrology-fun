<script lang="ts">
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

	interface Props {
		value: string;
		error?: string;
		onselect?: (event: { latitude: number; longitude: number; displayName: string }) => void;
		onerror?: (error: string) => void;
	}

	let { value = $bindable(), error = '', onselect, onerror }: Props = $props();

	let placeSuggestions: PlaceSuggestion[] = $state([]);
	let showSuggestions = $state(false);
	let isLoadingSuggestions = $state(false);
	let abortController: AbortController | null = null;
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Reactive statement to fetch place suggestions when value changes
	$effect(() => {
		if (!value || value.length < 3) {
			placeSuggestions = [];
			showSuggestions = false;
		} else {
			// Debounce the API call
			if (debounceTimeout) clearTimeout(debounceTimeout);
			if (abortController) abortController.abort();

			debounceTimeout = setTimeout(async () => {
				abortController = new AbortController();
				isLoadingSuggestions = true;

				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
							value
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
				} catch (err) {
					if (err instanceof Error && err.name === 'AbortError') {
						return;
					}
					console.error('Error fetching place suggestions:', err);
					onerror?.('Unable to fetch locations. Please try again.');
					placeSuggestions = [];
				} finally {
					isLoadingSuggestions = false;
				}
			}, 500);
		}
	});

	function selectPlace(place: PlaceSuggestion) {
		const lat = parseFloat(place.lat);
		const lon = parseFloat(place.lon);

		value = place.display_name;
		showSuggestions = false;
		placeSuggestions = [];

		onselect?.({
			latitude: lat,
			longitude: lon,
			displayName: place.display_name
		});
	}
</script>

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
		bind:value
		class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
		placeholder="Start typing a city..."
		autocomplete="off"
	/>
	{#if error}
		<p class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
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
				{#each placeSuggestions as place}
					<button
						type="button"
						onclick={() => selectPlace(place)}
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
