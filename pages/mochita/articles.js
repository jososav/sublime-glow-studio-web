import { useState } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import styles from "../../styles/Mochita.module.css";
import modalStyles from "../../styles/Modal.module.css";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEffect } from 'react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
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

  const handleEditArticle = (article) => {
    setEditingArticle(article);
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
                  onClick={() => handleEditArticle(article)}
                  className={styles.editButton}
                >
                  Editar
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
          <ArticleModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchArticles();
              setShowCreateModal(false);
            }}
          />
        )}

        {editingArticle && (
          <ArticleModal
            article={editingArticle}
            onClose={() => setEditingArticle(null)}
            onSuccess={() => {
              fetchArticles();
              setEditingArticle(null);
            }}
          />
        )}
      </div>
    </AdminProtected>
  );
};

const ArticleModal = ({ article, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    seoTitle: article?.seoTitle || '',
    metaDescription: article?.metaDescription || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (article) {
        // Editar artículo existente
        await updateDoc(doc(db, 'articles', article.id), formData);
      } else {
        // Crear nuevo artículo
        const slug = formData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        await addDoc(collection(db, 'articles'), {
          ...formData,
          slug,
          createdAt: new Date().toISOString()
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={`${modalStyles.modal} ${modalStyles.articleModal}`}>
        <h2>{article ? 'Editar Artículo' : 'Crear Nuevo Artículo'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Contenido (HTML)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={10}
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Meta Description</label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              required
              rows={3}
            />
          </div>
          <div className={modalStyles.modalActions}>
            <button type="button" className={modalStyles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={modalStyles.submitButton}>
              {article ? 'Guardar Cambios' : 'Crear Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Articles; 