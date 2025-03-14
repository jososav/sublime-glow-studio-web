import Head from 'next/head';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from '../../styles/Article.module.css';

// Remove client-side state management since we'll get data from SSR
const ArticlePage = ({ article, error, fullUrl }) => {
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!article) {
    return null;
  }

  const publishDate = new Date(article.createdAt).toISOString();

  // Format the date for the article
  const formattedDate = new Date(article.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create a clean excerpt for meta description (first 160 characters of content without HTML)
  const cleanExcerpt = article.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .slice(0, 160)
    .trim() + '...';

  return (
    <>
      <Head>
        <title>{`${article.title} | Sublime Glow Studio`}</title>
        <meta name="description" content={cleanExcerpt} />
        <meta
          name="keywords"
          content={`${article.tags?.join(', ')}, belleza, estética, consejos de belleza, sublime glow studio`}
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={cleanExcerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={fullUrl} />
        {article.image && (
          <meta property="og:image" content={article.image} />
        )}
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:author" content="Sublime Glow Studio" />
        {article.tags?.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={cleanExcerpt} />
        {article.image && (
          <meta name="twitter:image" content={article.image} />
        )}
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sublime Glow Studio" />
        <link rel="canonical" href={fullUrl} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": article.title,
              "description": cleanExcerpt,
              "image": article.image,
              "datePublished": new Date(article.createdAt).toISOString(),
              "dateModified": new Date(article.updatedAt || article.createdAt).toISOString(),
              "author": {
                "@type": "Organization",
                "name": "Sublime Glow Studio"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Sublime Glow Studio",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://sublimeglowstudio.com/logo.jpeg"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
              },
              "keywords": article.tags?.join(', '),
              "articleBody": article.content.replace(/<[^>]*>/g, '')
            })
          }}
        />
      </Head>
      <article className={styles.article}>
        <div className={styles.metadata}>
          <time dateTime={publishDate}>
            {formattedDate}
          </time>
          {article.tags && (
            <div className={styles.tags}>
              {article.tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h1>{article.title}</h1>
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </>
  );
};

// Server-side rendering
export async function getServerSideProps({ params, res, req }) {
  try {
    const { slug } = params;
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    // If article not found, return 404
    if (querySnapshot.empty) {
      res.statusCode = 404;
      return {
        props: {
          error: 'Artículo no encontrado',
          article: null,
          fullUrl: ''
        }
      };
    }

    // Get the article data
    const articleData = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };

    // Construct the full URL for meta tags
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${req.headers.host}`;
    const fullUrl = `${baseUrl}/articulo/${slug}`;

    // Return the article data as props
    return {
      props: {
        article: JSON.parse(JSON.stringify(articleData)), // Serialize dates and other special types
        error: null,
        fullUrl
      }
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    res.statusCode = 500;
    return {
      props: {
        error: 'Error al cargar el artículo',
        article: null,
        fullUrl: ''
      }
    };
  }
}

export default ArticlePage; 