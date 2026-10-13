import { defineConfig } from 'vite';

export default defineConfig({
  // Relatívna base cesta: funguje na GitHub Pages (/Burnout-Inc./) aj v Capacitor APK.
  base: './',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
