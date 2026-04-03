export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });

    return;
  }

  const serviceWorkerUrl = `/sw.js?appVersion=${encodeURIComponent(__APP_VERSION__)}`;
  void navigator.serviceWorker.register(serviceWorkerUrl);
};
