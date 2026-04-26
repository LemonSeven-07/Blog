import { useState } from 'react';
import { Skeleton } from 'antd';
import styles from './index.module.scss';

export default function ImageWithSkeleton({
  src,
  shape,
  width,
  height = 'auto',
  alt = ''
}: {
  src: string;
  shape: 'square' | 'circle';
  width: string;
  height?: string;
  alt?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`${styles['image-wrapper']} app-image`}
      style={{ width, height, borderRadius: shape === 'circle' ? '50%' : 0 }}
    >
      {!loaded && <Skeleton.Image active className={styles.skeleton} />}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute',
          opacity: loaded ? 1 : 0,
          transition: 'opacity .3s',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loading="lazy"
      />
    </div>
  );
}
