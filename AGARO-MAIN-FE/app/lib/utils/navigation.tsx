/**
 * Navigation utilities with view transitions enabled by default
 *
 * This module provides wrappers around React Router's navigation primitives
 * that automatically enable view transitions for all navigations.
 */
import {
  Link as ReactRouterLink,
  type LinkProps as ReactRouterLinkProps,
  NavLink as ReactRouterNavLink,
  type NavLinkProps as ReactRouterNavLinkProps,
  useNavigate as useReactRouterNavigate,
} from 'react-router';
import type { NavigateFunction } from 'react-router';

/**
 * Custom navigate hook that always enables view transitions
 *
 * @example
 * ```tsx
 * import { useNavigate } from '~/lib/utils/navigation';
 *
 * function MyComponent() {
 *   const navigate = useNavigate();
 *
 *   const handleClick = () => {
 *     navigate('/dashboard'); // Automatically uses viewTransition
 *   };
 * }
 * ```
 */
export function useNavigate(): NavigateFunction {
  const navigate = useReactRouterNavigate();

  return ((to, options) => {
    navigate(to, {
      ...options,
      viewTransition: true,
    });
  }) as NavigateFunction;
}

/**
 * Custom Link component that always enables view transitions
 *
 * All props from React Router's Link are supported.
 *
 * @example
 * ```tsx
 * import { Link } from '~/lib/utils/navigation';
 *
 * <Link to="/dashboard">Go to Dashboard</Link>
 * ```
 */
export function Link({ viewTransition, ...props }: ReactRouterLinkProps) {
  return <ReactRouterLink {...props} viewTransition={true} />;
}

/**
 * Custom NavLink component that always enables view transitions
 *
 * All props from React Router's NavLink are supported.
 *
 * @example
 * ```tsx
 * import { NavLink } from '~/lib/utils/navigation';
 *
 * <NavLink to="/dashboard">Dashboard</NavLink>
 * ```
 */
export function NavLink({ viewTransition, ...props }: ReactRouterNavLinkProps) {
  return <ReactRouterNavLink {...props} viewTransition={true} />;
}
