import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  telemetry: false,
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],

  devServer: {
    port: Number(process.env.APP_PORT) || 3000,
  },

  typescript: {
    strict: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      githubOauthAuthorizationUrl:
        process.env.GITHUB_OAUTH_AUTHORIZATION_URL ||
        'https://github.com/login/oauth/authorize',
    },
  },
});
