import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

  devtools: { enabled: true },

  app: {
    head: {
      title: 'CryptoFeed',
      meta: [
        { name: 'description', content: 'Real-time crypto news dashboard' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
