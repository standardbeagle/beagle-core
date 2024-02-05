import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Virtual Path Docs",
  description: "How to use Virtual Path",
  base: '/beagle-core/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Documentation', link: '/api-docs' }
    ],

    sidebar: [
      {
        text: 'How To',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'Documentation',
        items: [
          { text: 'API Reference', link: '/api-docs' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/standardbeagle/beagle-core/virtual-router' }
    ]
  }
})
