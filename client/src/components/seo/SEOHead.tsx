import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

const SITE_NAME = 'Roster';
const BASE_URL = 'https://www.rosterplatform.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title.includes('Roster') ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : BASE_URL);
  const image = ogImage || DEFAULT_OG_IMAGE;

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
