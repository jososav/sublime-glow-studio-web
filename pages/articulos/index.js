import { useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../styles/Articles.module.css';

const ARTICLES_PER_PAGE = 9;

export async function getServerSideProps() {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(
      articlesRef,
      orderBy('createdAt', 'desc'),
      limit(ARTICLES_PER_PAGE)
    );
    
    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const hasMore = articles.length === ARTICLES_PER_PAGE;

    return {
      props: {
        initialArticles: JSON.parse(JSON.stringify(articles)),
        hasMore
      }
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      props: {
        initialArticles: [],
        hasMore: false
      }
    };
  }
}

const ArticlesPage = ({ initialArticles, hasMore: initialHasMore }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const lastArticle = articles[articles.length - 1];
      const articlesRef = collection(db, 'articles');
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        startAfter(new Date(lastArticle.createdAt)),
        limit(ARTICLES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const newArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setArticles([...articles, ...newArticles]);
      setHasMore(newArticles.length === ARTICLES_PER_PAGE);
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Blog - Sublime Glow Studio</title>
        <meta 
          name="description" 
          content="Explora nuestros artículos sobre belleza, cuidado personal y las últimas tendencias en estética."
        />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Explora nuestros artículos sobre belleza y cuidado personal
        </p>

        <div className={styles.grid}>
          {articles.map((article) => (
            <Link 
              href={`/articulo/${article.slug}`}
              key={article.id}
              className={styles.card}
            >
              <article>
                <h2>{article.title}</h2>
                <p>{article.metaDescription}</p>
                <time dateTime={article.createdAt}>
                  {new Date(article.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </article>
            </Link>
          ))}
        </div>

        {hasMore && (
          <button
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar más artículos'}
          </button>
        )}
      </div>
    </>
  );
};

export default ArticlesPage; 