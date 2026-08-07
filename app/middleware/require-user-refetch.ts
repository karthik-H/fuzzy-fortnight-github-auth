export default defineNuxtRouteMiddleware(async () => {
  const { me } = useUserSession();
  const authResponse = await me();

  if (!authResponse) {
    return navigateTo('/login');
  }
});
