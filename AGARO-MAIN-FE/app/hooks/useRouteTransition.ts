import { useEffect, useMemo, useRef } from 'react';

const getDepth = (path: string) => path.split('/').filter(Boolean).length;

export default function useRouteTransition(pathname?: string) {
  const safePath = pathname ?? '/';
  const prevDepthRef = useRef(getDepth(safePath));
  const currentDepth = useMemo(() => getDepth(safePath), [safePath]);

  const direction = currentDepth >= prevDepthRef.current ? 'left' : 'right';

  useEffect(() => {
    prevDepthRef.current = currentDepth;
  }, [currentDepth]);

  return { direction, currentDepth } as const;
}
