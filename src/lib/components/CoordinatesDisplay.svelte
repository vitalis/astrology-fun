<script lang="ts">
	interface Props {
		latitude: number | null;
		longitude: number | null;
		utcOffset: number | null;
	}

	let { latitude, longitude, utcOffset }: Props = $props();
</script>

<div
	class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 border border-gray-200 dark:border-gray-600"
>
	<h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
		Coordinates (Auto-filled)
	</h3>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
		<div>
			<label for="latitude" class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5">
				Latitude
			</label>
			<input
				id="latitude"
				type="text"
				value={latitude !== null && latitude !== undefined ? latitude.toFixed(6) : ''}
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
				value={longitude !== null && longitude !== undefined ? longitude.toFixed(6) : ''}
				readonly
				class="w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[40px]"
				placeholder="Auto-filled"
			/>
		</div>
	</div>

	<div>
		<label for="utcOffset" class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5">
			UTC Offset
		</label>
		<input
			id="utcOffset"
			type="text"
			value={utcOffset !== null && utcOffset !== undefined
				? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}`
				: ''}
			readonly
			class="w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[40px]"
			placeholder="Auto-filled"
		/>
	</div>
</div>
