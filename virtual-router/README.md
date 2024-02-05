# Component Router

Compoent router is a basic memory only hook base router for react. Component router does not interface or connect with the browser path at all.

## Why Component Router

I built component router because I was working on a complicated react component intented to be used by multiple projects. I initally started building it with react router, which worked exactly as I needed it in my test project. However when I included it in multiple external projects, it forced me to use react router as the router for the entire project, and copy all the component routes up to the main router file.

I'm a huge fan of using routing for UI state management. I think the process of tying rednering components to manipulating the path with links and pattern matching makes my applications easier to maintain and understand. It also happens to be the way that http servers manage loading files.

## Getting Started

``` npm i component-router ```

The core of your application is the Provider which manages and shares path and route data to all its child components.

```
  <Component>
```
