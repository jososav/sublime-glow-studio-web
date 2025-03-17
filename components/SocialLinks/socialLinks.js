import Link from 'next/link';
import Image from 'next/image';
import styles from './socialLinks.module.css';

const SocialLinks = ({ className }) => {
  return (
    <div className={`${styles.socialLinks} ${className || ''}`}>
      <Link 
        href="https://www.facebook.com/people/Sublime-Glow-Studio/61574115724694/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <Image
          src="/facebook-icon.svg"
          alt="Facebook"
          width={24}
          height={24}
        />
      </Link>
      <Link 
        href="https://www.instagram.com/sublimeglowstudio" 
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <Image
          src="/instagram-icon.svg"
          alt="Instagram"
          width={24}
          height={24}
        />
      </Link>
      <Link 
        href="https://www.tiktok.com/@sublimeglows" 
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <Image
          src="/tiktok-icon.svg"
          alt="TikTok"
          width={24}
          height={24}
        />
      </Link>
      <Link 
        href="https://www.youtube.com/@SublimeGlowStudio" 
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <Image
          src="/youtube-icon.svg"
          alt="YouTube"
          width={24}
          height={24}
        />
      </Link>
    </div>
  );
};

export default SocialLinks; 