const BASE_URL = 'https://www.rosterplatform.com';

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Roster',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Roster is a creative operations platform that connects marketing teams with vetted creative professionals and manages projects with AI.',
    sameAs: [],
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Roster',
    url: BASE_URL,
  };
}

export function buildWebPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${BASE_URL}${url}`,
    isPartOf: { '@type': 'WebSite', name: 'Roster', url: BASE_URL },
  };
}

export function buildProductSchema(
  name: string,
  description: string,
  price: string | number,
  priceCurrency: string = 'USD',
  billingPeriod: string = 'month',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Organization', name: 'Roster' },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
      ...(billingPeriod === 'month' && { billingDuration: 'P1M' }),
      ...(billingPeriod === 'year' && { billingDuration: 'P1Y' }),
    },
  };
}

export function buildFAQSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildHowToSchema(name: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Roster',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Creative operations platform with AI project management, brand vault, talent discovery, and real-time collaboration for marketing teams.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '29',
      highPrice: '799',
      priceCurrency: 'USD',
      offerCount: 4,
    },
  };
}
