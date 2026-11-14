import { categories, tools } from '#lib/tools.js';
import { SITE_URL } from '#lib/site.js';

export const prerender = true;

export function GET() {
    const urls = [
        `${SITE_URL}/`,
        `${SITE_URL}/about/`,
        `${SITE_URL}/contact/`,
        ...categories.map((category) => `${SITE_URL}/${category.id}/`),
        ...tools.map((tool) => `${SITE_URL}${tool.path}/`)
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
