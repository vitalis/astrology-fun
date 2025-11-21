<script lang="ts">
	import { Page, Navbar } from 'konsta/svelte';
	import BirthForm from '$lib/components/BirthForm.svelte';
</script>

<svelte:head>
	<title>Birth Chart Calculator - Discover Your Cosmic Blueprint</title>
	<meta
		name="description"
		content="Calculate your astrology birth chart with precise coordinates and timezone data."
	/>
</svelte:head>

<Page>
	<Navbar
		title="Birth Chart Calculator"
		subtitle="Discover your cosmic blueprint"
		class="k-color-brand-primary"
	/>
	<BirthForm />
</Page>
