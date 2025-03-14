import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const generateSiteMap = (articles, baseUrl) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Páginas estáticas -->
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>

      <url>
        <loc>${baseUrl}/articulos</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>

      <url>
        <loc>${baseUrl}/promociones</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>

      <!-- Artículos -->
      ${articles
        .map(({ slug, createdAt }) => {
          return `
            <url>
              <loc>${baseUrl}/articulo/${slug}</loc>
              <lastmod>${new Date(createdAt).toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>`;
};

export default async function handler(req, res) {
  try {
    // Establecer los headers correctos
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');

    // Obtener la URL base
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

    // Obtener todos los artículos
    const articlesRef = collection(db, 'articles');
    const snapshot = await getDocs(articlesRef);
    const articles = snapshot.docs.map(doc => ({
      slug: doc.data().slug,
      createdAt: doc.data().createdAt
    }));

    // Generar el sitemap
    const sitemap = generateSiteMap(articles, baseUrl);

    // Enviar el sitemap
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
} 