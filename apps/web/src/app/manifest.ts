import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Touch Grass',
    short_name: 'Touch Grass',
    description: 'Choose a vibe, complete a real-world mission, and log what you discovered.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF9EF',
    theme_color: '#34784A',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
