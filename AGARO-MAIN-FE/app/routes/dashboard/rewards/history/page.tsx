/**
 * Claim History Page
 *
 * Displays history of claimed rewards.
 */
import { ClaimHistoryList } from '../components/claim-history-list';

export const handle = {
  breadcrumb: 'History',
};

export default function ClaimHistoryPage() {
  return <ClaimHistoryList />;
}
