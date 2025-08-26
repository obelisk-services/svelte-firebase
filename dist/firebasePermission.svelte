<script>
	import { onDestroy } from 'svelte';
	import { askPermissions } from './firebaseStore.js';
	import { permissionGranted } from './firebaseStore.js';
	import { swalWrap } from "svelte-js-functions-package";

	let { appName } = $props();

	let ap = $state(true);
	let deniedNotif = Notification.permission === 'denied';

	const unsubscribe = askPermissions.subscribe(value => {
		ap=value;
	});
	onDestroy(()=>{
		unsubscribe();
	});

	function requestPermission() {
		//console.log('Requesting permission...');
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				permissionGranted.set(true);
				ap=false;
				swalWrap.fire('Notificaciones activadas', '', 'success');
			}
		});
	}
	
	function showHowToUnblockNotifications(){
		swalWrap.fire('Notificaciones push desactivadas', '', 'info', {
			html: 'Para activar las notificaciones push, sigue estos pasos:<br/><br/><span class="underline">Si no tienes la app instalada</span>: <br/>1. Haz clic en el candado que aparece en la barra de direcciones.<br/>2. En la sección de notificaciones, selecciona "Permitir".<br/>3. Recarga la página.<br/><br/><span class="underline">Si la tienes instalada:</span><br/>1. Ve a ajustes del dispositivo.<br/>2. Busca la sección de apps.<br/>3. Encuentra Quo.<br/>4. Activa las notificaciones.'
		});
	}

	function showHowToUnblockNotificationsIoS(){
		swalWrap.fire('Notificaciones push no disponibles', '', 'info', {
			html: 'Instala '+appName+' en tu dispositivo para recibir notificaciones, sigue estos pasos:<br/><br/>1. Pulsa en <i class="icon-[ic--sharp-ios-share]"></i> en la barra inferior de tu navegador.<br/>2. Pulsa en "Añadir a pantalla de inicio"<br/>3. Accede desde el icono de la app que se acaba de crear y vuelve a pulsar sobre la campana de notificaciones para activarlas.'
		});
	}

    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test( userAgent );
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

</script>
{#if ap}
	{#if isIos() && !isInStandaloneMode()}
		<button onclick={showHowToUnblockNotificationsIoS} class=" flex flex-row gap-2 border-t-2 rounded-none border-black items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 text-left mt-2">
			<i class="icon-[mingcute--notification-off-fill] text-3xl"></i>
			<span>Notificaciones no disponibles</span>
			<i class="icon-[mdi--information-outline] text-2xl"></i>
		</button>
	{:else}
		{#if deniedNotif}
			<button onclick={showHowToUnblockNotifications} class="flex flex-row gap-2 border-t-2 rounded-none border-black items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 text-left mt-2">
				<i class="icon-[mingcute--notification-off-fill] text-3xl"></i>
				<span>Notificaciones push bloqueadas</span>
				<i class="icon-[mdi--information-outline] text-2xl"></i>
			</button>
		{:else}
			<button onclick={requestPermission} class="flex flex-row gap-2 border-t-2 rounded-none border-black items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 text-left mt-2">
				<i class="icon-[streamline--notification-message-alert-solid] text-3xl"></i>
				<span>Activar notificaciones push (opcional)</span>
			</button>
		{/if}
	{/if}
{/if}