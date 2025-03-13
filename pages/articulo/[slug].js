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

  return (
    <>
      <Head>
        <title>{article.seoTitle || article.title}</title>
        <meta name="description" content={article.metaDescription} />
        <meta property="og:title" content={article.seoTitle || article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={fullUrl} />
        <meta property="article:published_time" content={publishDate} />
        <link rel="canonical" href={fullUrl} />
        {/* Add more meta tags as needed */}
      </Head>
      <article className={styles.article}>
        <h1>{article.title}</h1>
        <time dateTime={publishDate} className={styles.date}>
          {new Date(article.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
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