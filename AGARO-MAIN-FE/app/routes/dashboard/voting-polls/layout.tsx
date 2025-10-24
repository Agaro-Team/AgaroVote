import { Outlet } from 'react-router';

export const handle = {
  breadcrumb: 'Voting Polls',
};

export default function VotingPollsLayout() {
  return <Outlet />;
}
