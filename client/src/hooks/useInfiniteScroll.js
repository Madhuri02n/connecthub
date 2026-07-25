import { useRef, useCallback } from 'react';

/**
 * Returns a ref-callback to attach to the last item in a list. When that
 * item scrolls into view, `onIntersect` fires (typically "load next page").
 * Uses IntersectionObserver rather than scroll-position math for performance.
 */
export const useInfiniteScroll = (onIntersect, { hasMore, isLoading }) => {
  const observerRef = useRef(null);

  const lastItemRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onIntersect();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onIntersect]
  );

  return lastItemRef;
};
