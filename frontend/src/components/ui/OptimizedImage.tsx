import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  placeholder = 'blur',
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'cover':
        return 'object-cover';
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'none':
        return 'object-none';
      case 'scale-down':
        return 'object-scale-down';
      default:
        return 'object-cover';
    }
  };

  const containerClasses = cn(
    'relative overflow-hidden',
    getAspectRatioClass(),
    className
  );

  const imageClasses = cn(
    'w-full h-full transition-opacity duration-300',
    getObjectFitClass(),
    {
      'opacity-0': !isLoaded && !hasError,
      'opacity-100': isLoaded || hasError,
    }
  );

  const placeholderClasses = cn(
    'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
    {
      'opacity-100': !isLoaded && !hasError,
      'opacity-0': isLoaded || hasError,
    },
    placeholder === 'blur' ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'
  );

  return (
    <div className={containerClasses}>
      {/* Placeholder */}
      <div className={placeholderClasses}>
        {placeholder === 'blur' ? (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        ) : (
          <div className="text-gray-400 text-sm">Loading...</div>
        )}
      </div>

      {/* Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError && fallback ? fallback : src}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded"></div>
            <p className="text-sm">画像を読み込めませんでした</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;