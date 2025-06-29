import React, { useState, useEffect, useRef } from 'react';
import { IconButton } from "@/ui/components/IconButton";
import { 
  FeatherX, 
  FeatherChevronLeft, 
  FeatherChevronRight,
  FeatherZoomIn
} from "@subframe/core";

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
  webpUrl?: string; // Optional WebP version
}

interface PhotoGalleryProps {
  images: GalleryImage[];
  className?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, className = "" }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedImageIndex, images.length]);

  // Focus trap for lightbox
  useEffect(() => {
    if (isLightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [isLightboxOpen]);

  // Preload adjacent images
  useEffect(() => {
    if (selectedImageIndex !== null) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < images.length) {
          const img = new Image();
          img.src = images[index].url;
        }
      };
      
      // Preload next and previous images
      preloadImage(selectedImageIndex + 1);
      preloadImage(selectedImageIndex - 1);
    }
  }, [selectedImageIndex, images]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const navigateNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const navigatePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigateNext();
    }
    
    if (isRightSwipe) {
      navigatePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Announce image changes to screen readers
  const announceImageChange = (index: number) => {
    return `Image ${index + 1} of ${images.length}: ${images[index].alt}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative overflow-hidden rounded-lg aspect-[4/3] shadow-md cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <picture>
              {image.webpUrl && <source srcSet={image.webpUrl} type="image/webp" />}
              <img 
                src={image.url} 
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            </picture>
            
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full transition-transform duration-200 group-hover:translate-y-0">
                <p className="text-sm">{image.caption}</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-20"></div>
            
            <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="bg-white bg-opacity-80 rounded-full p-1">
                <FeatherZoomIn className="w-5 h-5 text-neutral-800" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[1000] bg-black bg-opacity-90 flex items-center justify-center"
          ref={lightboxRef}
          tabIndex={0}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-modal="true"
          role="dialog"
          aria-label={`Image gallery lightbox, ${announceImageChange(selectedImageIndex)}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-[1010] bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <FeatherX className="w-6 h-6" />
          </button>
          
          {/* Navigation buttons */}
          <button
            className="absolute left-4 z-[1010] bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors"
            onClick={navigatePrevious}
            aria-label="Previous image"
          >
            <FeatherChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            className="absolute right-4 z-[1010] bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors"
            onClick={navigateNext}
            aria-label="Next image"
          >
            <FeatherChevronRight className="w-6 h-6" />
          </button>
          
          {/* Main image */}
          <div className="w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Caption */}
            {images[selectedImageIndex].caption && (
              <div className="bg-black bg-opacity-70 p-4 mt-2 rounded w-full max-w-3xl">
                <p className="text-white text-center">{images[selectedImageIndex].caption}</p>
              </div>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-white text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;