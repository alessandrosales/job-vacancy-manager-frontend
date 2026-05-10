/**
 * SEO config para a landing pública (`/`).
 *
 * Decisão consciente: `meta()` da landing é travado em inglês mesmo quando
 * a UI for renderizada em pt-br/es — Hireest mira mercado anglófono e
 * crawlers veem sempre o mesmo conjunto canônico em EN.
 */

export const SITE_URL = "https://hireest.com"
export const BRAND_NAME = "Hireest"
export const TWITTER_HANDLE = "@hireest"
export const AUTHOR_NAME = "Alessandro Sales"

const LINKEDIN_URL = "https://www.linkedin.com/company/hireest"
const GITHUB_URL = "https://github.com/hireest"
const X_URL = "https://x.com/hireest"

const LOGO_PATH = "/logo-bg-light.png"
const OG_IMAGE_PATH = "/thumb.jpg"

export const LANDING_SEO_EN = {
  title: `${BRAND_NAME} — Job Search Tracker & ATS Resume Builder`,
  description:
    "Track every job opportunity in table or Kanban, import your LinkedIn PDF, and ship ATS-friendly resumes in multiple formats — all in one calm workspace.",
  ogImage: OG_IMAGE_PATH,
  ogImageAlt: `${BRAND_NAME} — The calmest way to pursue your next role.`,
  url: "/",
} as const

function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

type MetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { tagName: "link"; rel: string; href: string; [k: string]: string }
  | { "script:ld+json": Record<string, unknown> }

/**
 * Construtor dos descriptors aceitos pelo `meta()` do React Router 7
 * para a landing. Inclui meta básicos, canonical, Open Graph,
 * Twitter Card e três blocos JSON-LD (Organization, WebSite,
 * SoftwareApplication).
 */
export function buildLandingMetaDescriptors(): MetaDescriptor[] {
  const seo = LANDING_SEO_EN
  const canonical = absoluteUrl(seo.url)
  const ogImageAbsolute = absoluteUrl(seo.ogImage)
  const logoAbsolute = absoluteUrl(LOGO_PATH)

  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: logoAbsolute,
    },
    sameAs: [LINKEDIN_URL, GITHUB_URL, X_URL],
    founder: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
  }

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND_NAME,
    url: SITE_URL,
    inLanguage: "en-US",
    publisher: { "@id": `${SITE_URL}/#organization` },
  }

  const softwareApplication = {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: BRAND_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: seo.description,
    image: ogImageAbsolute,
    inLanguage: ["en-US", "pt-BR", "es"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }

  const jsonLdGraph: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@graph": [organization, website, softwareApplication],
  }

  return [
    { title: seo.title },
    { name: "description", content: seo.description },
    { name: "author", content: AUTHOR_NAME },
    {
      name: "robots",
      content: "index,follow,max-image-preview:large,max-snippet:-1",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: canonical,
    },

    { property: "og:type", content: "website" },
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:url", content: canonical },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:image", content: ogImageAbsolute },
    { property: "og:image:secure_url", content: ogImageAbsolute },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: seo.ogImageAlt },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
    { name: "twitter:image", content: ogImageAbsolute },
    { name: "twitter:image:alt", content: seo.ogImageAlt },

    {
      tagName: "link",
      rel: "preload",
      as: "image",
      href: "/photo-hero.jpg",
      fetchpriority: "high",
    },

    { "script:ld+json": jsonLdGraph },
  ]
}
