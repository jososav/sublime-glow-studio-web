import { useState } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import styles from "../../styles/Mochita.module.css";
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEffect } from 'react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const articlesRef = collection(db, 'articles');
      const snapshot = await getDocs(articlesRef);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        await deleteDoc(doc(db, 'articles', articleId));
        await fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Artículos</h1>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Crear Nuevo Artículo
          </button>
        </div>

        <div className={styles.articlesList}>
          {articles.map((article) => (
            <div key={article.id} className={styles.articleCard}>
              <h3>{article.title}</h3>
              <p>URL: /articulo/{article.slug}</p>
              <div className={styles.articleActions}>
                <button 
                  onClick={() => handleDeleteArticle(article.id)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
                <button 
                  onClick={() => window.open(`/articulo/${article.slug}`, '_blank')}
                  className={styles.viewButton}
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <CreateArticleModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchArticles();
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </AdminProtected>
  );
};

const CreateArticleModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    seoTitle: '',
    metaDescription: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD') // Normalizar caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
        .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
        .replace(/(^-|-$)/g, ''); // Eliminar guiones al inicio y final

      await addDoc(collection(db, 'articles'), {
        ...formData,
        slug,
        createdAt: new Date().toISOString()
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Crear Nuevo Artículo</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contenido (HTML)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={10}
            />
          </div>
          <div className={styles.formGroup}>
            <label>SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Meta Description</label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              required
              rows={3}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Crear Artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Articles; 