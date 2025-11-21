<script lang="ts">
	import { Card, Block } from 'konsta/svelte';

	interface Props {
		latitude: number | null;
		longitude: number | null;
		utcOffset: number | null;
	}

	let { latitude, longitude, utcOffset }: Props = $props();
</script>

<Card outline class="!bg-gray-50 dark:!bg-gray-800/50">
	<Block class="!p-4 space-y-3">
		<div class="flex justify-between items-center">
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</span>
			<span class="text-sm text-gray-900 dark:text-white font-mono">
				{latitude !== null && latitude !== undefined ? latitude.toFixed(6) : '—'}
			</span>
		</div>
		<div class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</span>
			<span class="text-sm text-gray-900 dark:text-white font-mono">
				{longitude !== null && longitude !== undefined ? longitude.toFixed(6) : '—'}
			</span>
		</div>
		<div class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">UTC Offset</span>
			<span class="text-sm text-gray-900 dark:text-white font-mono">
				{utcOffset !== null && utcOffset !== undefined
					? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}`
					: '—'}
			</span>
		</div>
	</Block>
</Card>
