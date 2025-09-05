import { useState, useEffect, useRef } from 'react';

interface SwipeInput {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

interface SwipeOutput {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export const useSwipe = (input: SwipeInput): SwipeOutput => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const threshold = input.threshold || 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // 水平方向のスワイプ
      if (isLeftSwipe && input.onSwipeLeft) {
        input.onSwipeLeft();
      }
      if (isRightSwipe && input.onSwipeRight) {
        input.onSwipeRight();
      }
    } else {
      // 垂直方向のスワイプ
      if (isUpSwipe && input.onSwipeUp) {
        input.onSwipeUp();
      }
      if (isDownSwipe && input.onSwipeDown) {
        input.onSwipeDown();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// 画像ギャラリー用のスワイプフック
export const useImageSwipe = (
  images: string[],
  initialIndex: number = 0
) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
  });

  return {
    currentIndex,
    setCurrentIndex,
    nextImage,
    prevImage,
    swipeHandlers,
  };
};