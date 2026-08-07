export default defineNuxtRouteMiddleware(async () => {
  const { isLoggedIn } = useUserSession();

  if (!isLoggedIn.value) {
    return navigateTo('/login');
  }

  return true;
});
