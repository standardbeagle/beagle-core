import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Virtual Router",
  description: "Memory-only, hook-based routing for React",
  base: '/beagle-core/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API', link: '/api-docs' },
      { text: 'Connectors', link: '/connectors' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Hooks', link: '/api-docs' },
          { text: 'Components', link: '/api-docs#components' },
          { text: 'Connectors', link: '/connectors' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/standardbeagle/beagle-core' }
    ]
  }
})
