// Événements de conversion custom (quiz, calculateurs) envoyés vers GA4.
// Même règle que le reste du site : gtag n'existe que si l'utilisateur a
// consenti à la catégorie "audience" (Analytics.astro) — tant que ce n'est
// pas le cas, cette fonction ne fait rien, elle ne met rien en attente.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
