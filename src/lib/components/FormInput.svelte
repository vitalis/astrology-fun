<script lang="ts">
	interface Props {
		id: string;
		label: string;
		type?: string;
		required?: boolean;
		error?: string;
		value: string;
		placeholder?: string;
		step?: string;
	}

	let {
		id,
		label,
		type = 'text',
		required = false,
		error = '',
		value = $bindable(),
		placeholder = '',
		step = undefined
	}: Props = $props();
</script>

<div>
	<label
		for={id}
		class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
	>
		{label}
		{#if required}
			<span class="text-red-500 dark:text-red-400">*</span>
		{:else}
			<span class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-normal">(optional)</span
			>
		{/if}
	</label>
	<input
		{id}
		{type}
		{placeholder}
		{step}
		bind:value
		class="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition min-h-[44px] sm:min-h-[48px]"
	/>
	{#if error}
		<p class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
