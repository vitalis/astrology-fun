<script lang="ts">
	import { List, ListInput, ListItem, Block, Preloader } from 'konsta/svelte';

	interface PlaceSuggestion {
		display_name: string;
		lat: string;
		lon: string;
		address: {
			country?: string;
			state?: string;
			city?: string;
			town?: string;
			village?: string;
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
	let skipNextEffect = false; // Flag to prevent API call after selection

	// Reactive statement to fetch place suggestions when value changes
	$effect(() => {
		// Skip the effect if we're setting the value programmatically after selection
		if (skipNextEffect) {
			skipNextEffect = false;
			return;
		}

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
						)}&limit=10&addressdetails=1&featuretype=city`,
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

					// Filter to only include cities, towns, and villages
					const filteredData = data.filter(
						(place: PlaceSuggestion) =>
							place.address?.city || place.address?.town || place.address?.village
					);

					placeSuggestions = filteredData;
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

		// Set flag to skip the next effect run
		skipNextEffect = true;

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
	<List>
		<ListInput
			label="Place of Birth"
			type="text"
			placeholder="Start typing a city..."
			bind:value
			floatingLabel
			clearButton
			error={!!error}
			errorMessage={error}
		/>
	</List>

	<!-- Autocomplete Suggestions -->
	{#if showSuggestions}
		<div class="absolute z-20 w-full mt-1 shadow-lg rounded-lg overflow-hidden">
			<List>
				{#if isLoadingSuggestions}
					<ListItem>
						<div class="flex items-center justify-center py-4">
							<Preloader />
							<span class="ml-2">Searching...</span>
						</div>
					</ListItem>
				{:else if placeSuggestions.length > 0}
					{#each placeSuggestions as place (place.display_name)}
						<ListItem
							link
							title={place.display_name}
							onClick={() => selectPlace(place)}
						/>
					{/each}
				{:else}
					<ListItem>
						<div class="text-center py-4 text-gray-600 dark:text-gray-400">
							No cities found
						</div>
					</ListItem>
				{/if}
			</List>
		</div>
	{/if}
</div>
