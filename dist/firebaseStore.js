import { writable } from 'svelte/store';

export let askPermissions = writable(true);
export let permissionGranted = writable(false);
export const notificationsMenu = writable([]);