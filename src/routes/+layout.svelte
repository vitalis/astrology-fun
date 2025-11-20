<script lang="ts">
	import '../app.css';
	import { KonstaProvider } from 'konsta/svelte';

	// Detect iOS for native-like experience
	const isIOS = typeof window !== 'undefined' &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);
	const theme = isIOS ? 'ios' : 'material';
</script>

<KonstaProvider theme={theme}>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6 transition-colors {theme === 'ios' ? 'k-ios' : 'k-material'}">
		<slot />
	</div>
</KonstaProvider>
