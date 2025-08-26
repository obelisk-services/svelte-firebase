<script>
    import { onDestroy } from 'svelte';
	import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

    import { initializeApp } from "firebase/app";
	import { getMessaging, onMessage, getToken } from "firebase/messaging";

	import { askPermissions } from './firebaseStore.js';
	import { permissionGranted, notificationsMenu } from './firebaseStore.js';
  	import { Toaster, toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { darkMode, config } = $props();
	let pg = $state(false);

	const app = initializeApp(config.firebaseConfig);
	const messaging = getMessaging(app);

	const unsubscribe = permissionGranted.subscribe(value => {
		pg=value;
	});
	
	onDestroy(unsubscribe);

    // onMount(()=>{
	// 	//console.log('config')
	// 	//configureNotifications();
	// });

	onMessage(messaging, (payload) => {
		//console.log('Message received. ', payload);
		let href=payload.fcmOptions.link;
		notificationsMenu.update(n => {n.push({text: payload.notification.title, count:1, href: href}); return n;});
		toast(payload.notification.title, {
			description: payload.notification.body,
			action: {
				label: 'Ir',
				onClick: () => goto(href),
			},
			duration: 10000
		});
	});
	
	function configureNotifications(ask){
		//console.log('check')
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			if(registrations.length===0){
				askPermissions.set(false); //No service worker registered
				//console.log('No service worker registered');
				return;
			}
			if (Notification.permission !== "granted") {
				askPermissions.set(true); //No permission granted
				//console.log('No permission granted');
				return;
			}
			getToken(messaging, {vapidKey: config.vapidPublicKey, serviceWorkerRegistration: registrations[0]}).then(async (currentToken) => {
				if (currentToken) {
					//console.log('Token available: ', currentToken);
					askPermissions.set(false); //Permisos ya concedidos
					await fetchUserAttributes().then((userAttributes) => {
						//console.log('User attributes fetched: ', userAttributes);
						if(userAttributes['custom:deviceToken']?.includes(currentToken)) return; //Ya esta registrado el token
						if(!userAttributes['custom:deviceToken'])
							updateUserAttributes({userAttributes: {'custom:deviceToken': currentToken}});
						else
							updateUserAttributes({userAttributes:{'custom:deviceToken': currentToken+','+userAttributes['custom:deviceToken']}})
					}).catch((error) => {
						console.error('Error fetching user attributes: ', error);
					});
				} else {
					// Show permission request UI
					askPermissions.set(true);
					//console.log('No registration token available. Request permission to generate one.');
					// ...
				}
			}).catch((err) => {
				askPermissions.set(false); //Seguramente los permisos esten bloqueados, ni le pregunto
				//console.log('An error occurred while retrieving token. ', err);
				// ...
			});
		});
	}

	$effect(() => {
		configureNotifications(pg);
	});
</script>
<Toaster theme={darkMode?'dark':'light'} position="bottom-center" closeButton richColors/>