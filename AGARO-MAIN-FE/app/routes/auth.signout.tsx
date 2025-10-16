/**
 * Sign Out Resource Route
 *
 * Clears the authentication cookie and redirects to home
 */
import { redirect } from 'react-router';
import { signOut } from '~/lib/auth/auth.server';

/**
 * POST /auth/signout
 * Sign out user and clear cookie
 */
export async function action({ request }: { request: Request }) {
  return redirect('/', {
    headers: await signOut(),
  });
}

/**
 * GET /auth/signout
 * Also support GET requests for convenience
 */
export async function loader({ request }: { request: Request }) {
  return redirect('/', {
    headers: await signOut(),
  });
}
