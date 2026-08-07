export default defineNuxtPlugin(() => {
  const { handleUnauthorized } = useUserSession();

  const authFetch = $fetch.create({
    onRequest({ options }) {
      const token = useCookie<string>('token').value;

      if (token) {
        const headers = new Headers(options.headers as HeadersInit);
        headers.set('Authorization', `Bearer ${token}`);
        options.headers = headers;
      }
    },
    onResponseError({ response }) {
      if (response?.status === 401) {
        handleUnauthorized();
      }
    },
  });

  globalThis.$fetch = authFetch;
});
