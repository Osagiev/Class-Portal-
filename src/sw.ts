/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

// vite-plugin-pwa (injectManifest mode) replaces this with the list of
// built assets to precache for offline support. This app no longer uses
// Firebase Cloud Messaging for push notifications (that requires the
// Blaze plan, which this project isn't on), so this service worker only
// handles offline precaching -- no FCM background message handling.
precacheAndRoute(self.__WB_MANIFEST);
