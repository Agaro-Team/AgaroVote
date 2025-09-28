// src/hooks/useScrollTo.ts
import { scroller } from 'react-scroll';
import { useNavigate } from 'react-router-dom';

export const useScrollTo = () => {
  const navigate = useNavigate();

  return (to: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');

      setTimeout(() => {
        scroller.scrollTo(to, {
          smooth: true,
          duration: 500,
          offset: 0,
        });
      }, 200);
    } else {
      scroller.scrollTo(to, {
        smooth: true,
        duration: 500,
        offset: 0,
      });
    }
  };
};
