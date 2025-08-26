<script>
	import { clickOutside } from "svelte-js-functions-package";
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import { notificationsMenu } from './firebaseStore.js';

	import FirebasePermission from "./firebasePermission.svelte";
	import FirebaseHandler from "./firebaseHandler.svelte";

	let showNotificationsMenu=$state(false);
	let { darkMode, config, appName='' } = $props();

	let nm=$state([
		//{text: 'Nuevos contratos', count: 1, href: '/agente/contratos'}, //Ejemplo
	]);

	const unsubscribe = notificationsMenu.subscribe(value => {
		nm=value;
	});
	onDestroy(()=>{
		unsubscribe();
	});

	function removeNotificationByPosition(pos){
		notificationsMenu.update(n => {
			return n.filter((item,i) => pos!==i);
		});
	}

</script>

<div class="relative flex">
	<button onclick={() => (showNotificationsMenu = !showNotificationsMenu)} class="relative align-middle rounded-md focus:outline-none focus:shadow-outline-red flex flex-col">
		<i class="icon-[mdi--bell] icon"></i>
		{#if nm.length>0}
			<i class="absolute -top-1 -right-1 text-app-600 icon-[mdi--circle] text-xs"></i>
			<i class="absolute -top-1 -right-1 text-app-600 icon-[mdi--circle] text-xs animate-ping"></i>
		{/if}
		<FirebaseHandler {darkMode} {config}/>
	  </button>
	  {#if showNotificationsMenu}
		<ul transition:fade use:clickOutside onoutclick={() => (showNotificationsMenu = false)} class="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-600 bg-white border border-gray-100 rounded-md shadow-md dark:text-gray-300 dark:border-gray-700 dark:bg-gray-700">
			{#each nm as n,i}
				<li class="flex">
					<a onclick={() => {showNotificationsMenu = false; removeNotificationByPosition(i);}} class="inline-flex items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200" href="{n.href}">
						<span>{n.text}</span>
						<span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-app-600 bg-app-100 rounded-full dark:text-app-100 dark:bg-app-600">{n.count}</span>
					</a>
					<button type="button" aria-label="Eliminar notificación" onclick={() => removeNotificationByPosition(i)}>
						<i class="icon-[mdi--close] text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200 cursor-pointer"></i>
					</button>
				</li>
			{:else}
				<li class="flex">
					<p class="inline-flex items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md">
						<span>No hay notificaciones</span>
					</p>
				</li>
			{/each}
			<li class="!mt-0">
				<FirebasePermission {appName} />
			</li>
		</ul>
		
	{/if}
</div>
