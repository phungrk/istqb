/** Public origin used for canonical URLs, the sitemap and Open Graph. Set NEXT_PUBLIC_SITE_URL when a custom domain is attached. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://testpassed.vercel.app").replace(/\/+$/, "");
export const SITE_NAME = "Testpath";
