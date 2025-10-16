/**
 * SIWE Authentication Resource Route
 *
 * Handles the SIWE authentication flow:
 * - GET: Fetch nonce from backend
 * - POST: Verify signature and set auth cookie
 *
 * Reference: https://reactrouter.com/explanation/sessions-and-cookies
 */
import { data, redirect } from 'react-router';
import { setAuthToken } from '~/lib/auth/auth.server';

const API_BASE_URL = process.env.VITE_AGARO_VOTE_API_ENTRYPOINT || 'http://localhost:3000/api';

/**
 * GET /auth/siwe?walletAddress=0x...
 * Fetch nonce for SIWE message
 */
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');

  if (!walletAddress) {
    return data({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      return data({ error: 'Failed to fetch nonce from backend' }, { status: response.status });
    }

    const responseData = await response.json();
    return data(responseData);
  } catch (error) {
    console.error('Error fetching nonce:', error);
    return data({ error: 'Network error while fetching nonce' }, { status: 500 });
  }
}

/**
 * POST /auth/siwe
 * Verify SIWE signature and set authentication cookie
 */
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  const message = formData.get('message') as string;
  const signature = formData.get('signature') as string;
  const walletAddress = formData.get('walletAddress') as string;

  if (!message || !signature || !walletAddress) {
    return data({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Verify signature with backend
    const response = await fetch(`${API_BASE_URL}/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        signature,
        walletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend verification error:', errorData);
      return data(
        {
          error: errorData.message || 'Signature verification failed',
        },
        { status: response.status }
      );
    }

    const {
      data: { accessToken },
    } = await response.json();

    // Set cookie and redirect to dashboard
    return redirect('/dashboard/voting-polls', {
      headers: await setAuthToken(accessToken),
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return data({ error: 'Network error during verification' }, { status: 500 });
  }
}
