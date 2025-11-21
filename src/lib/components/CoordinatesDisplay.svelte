<script lang="ts">
	import { List, ListItem } from 'konsta/svelte';

	interface Props {
		latitude: number | null;
		longitude: number | null;
		utcOffset: number | null;
	}

	let { latitude, longitude, utcOffset }: Props = $props();
</script>

<List>
	<ListItem
		title="Latitude"
		after={latitude !== null && latitude !== undefined ? latitude.toFixed(6) : '—'}
	/>

	<ListItem
		title="Longitude"
		after={longitude !== null && longitude !== undefined ? longitude.toFixed(6) : '—'}
	/>

	<ListItem
		title="UTC Offset"
		after={utcOffset !== null && utcOffset !== undefined
			? `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}`
			: '—'}
	/>
</List>
