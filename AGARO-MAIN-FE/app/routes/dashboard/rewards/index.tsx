/**
 * Rewards Index - Redirects to Claimable Tab
 *
 * When users visit /dashboard/rewards, redirect them to the claimable tab
 */
import { redirect } from 'react-router';

export async function clientLoader() {
  return redirect('/dashboard/rewards/claimable');
}

export default function RewardsIndex() {
  return null;
}
