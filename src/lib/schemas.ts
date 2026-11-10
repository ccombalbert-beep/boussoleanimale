export function webApplicationSchema({ nom, url, description }: { nom: string; url: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: nom,
    url,
    description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: 'Boussole Animale' },
  };
}
