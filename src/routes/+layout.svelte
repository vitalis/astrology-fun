<script lang="ts">
	import '../app.css';
	import { App } from 'konsta/svelte';

	// Detect iOS for native-like experience
	const isIOS = typeof window !== 'undefined' &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);
	const theme = isIOS ? 'ios' : 'material';
</script>

<App theme={theme} safeAreas>
	<slot />
</App>
