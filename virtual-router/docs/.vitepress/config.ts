import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Virtual Router",
  description: "Memory-only, hook-based routing for React",
  base: '/beagle-core/',

  // VitePress ships no canonical tag, and this site answers on both
  // /getting-started and /getting-started.html. Internal links all use the
  // .html form, so that is the one the canonical names.
  transformPageData(pageData) {
    const canonical = `https://dev.standardbeagle.com/beagle-core/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonical }])
  },
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
