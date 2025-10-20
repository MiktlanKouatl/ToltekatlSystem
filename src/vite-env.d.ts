// src/vite-env.d.ts

/// <reference types="vite/client" />

// Declara que cualquier import que termine en .glsl?raw es un string
declare module '*?raw' {
  const content: string
  export default content
}