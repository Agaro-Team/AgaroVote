import {
  AudioWaveform,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Coins,
  Command,
  GalleryVerticalEnd,
  History,
  LayoutDashboard,
  Settings2,
  Shield,
  Vote,
} from 'lucide-react';
import { NavMain } from '~/components/nav-main';
import { NavProjects } from '~/components/nav-projects';
import { NavUser } from '~/components/nav-user';
import { TeamSwitcher } from '~/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '~/components/ui/sidebar';

import * as React from 'react';

// This is sample data.
const data = {
  user: {
    name: 'AgaroVote User',
    email: 'user@agarovote.com',
    avatar: '/avatars/user.jpg',
  },
  teams: [
    {
      name: 'AgaroVote',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Agaro Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Demo Team',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/dashboard',
        },
        {
          title: 'My Activity',
          url: '/dashboard/activity',
        },
        {
          title: 'Analytics',
          url: '/dashboard/analytics',
        },
      ],
    },
    {
      title: 'Voting Pools',
      url: '/voting-pools',
      icon: Vote,
      items: [
        {
          title: 'Browse All',
          url: '/voting-pools',
        },
        {
          title: 'Active Polls',
          url: '/voting-pools/active',
        },
        {
          title: 'Completed',
          url: '/voting-pools/completed',
        },
        {
          title: 'Create New',
          url: '/dashboard/voting-pools/create',
        },
      ],
    },
    {
      title: 'My Votes',
      url: '/my-votes',
      icon: History,
      items: [
        {
          title: 'Vote History',
          url: '/my-votes',
        },
        {
          title: 'Pending Votes',
          url: '/my-votes/pending',
        },
        {
          title: 'Participated',
          url: '/my-votes/participated',
        },
      ],
    },
    {
      title: 'Rewards & Staking',
      url: '/rewards',
      icon: Coins,
      items: [
        {
          title: 'My Rewards',
          url: '/rewards',
        },
        {
          title: 'Claim Rewards',
          url: '/rewards/claim',
        },
        {
          title: 'Staking Pool',
          url: '/rewards/staking',
        },
        {
          title: 'Reward History',
          url: '/rewards/history',
        },
      ],
    },
    {
      title: 'Verification',
      url: '/verification',
      icon: Shield,
      items: [
        {
          title: 'Blockchain Explorer',
          url: '/verification/explorer',
        },
        {
          title: 'Vote Verification',
          url: '/verification/votes',
        },
        {
          title: 'Transaction History',
          url: '/verification/transactions',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '/docs',
      icon: BookOpen,
      items: [
        {
          title: 'Getting Started',
          url: '/docs',
        },
        {
          title: 'How to Vote',
          url: '/docs/voting',
        },
        {
          title: 'Voting Models',
          url: '/docs/models',
        },
        {
          title: 'FAQ',
          url: '/docs/faq',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2,
      items: [
        {
          title: 'Profile',
          url: '/settings',
        },
        {
          title: 'Wallet',
          url: '/settings/wallet',
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
        },
        {
          title: 'Security',
          url: '/settings/security',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'National Election 2025',
      url: '/organizations/election-2025',
      icon: Award,
    },
    {
      name: 'DAO Governance',
      url: '/organizations/dao',
      icon: Building2,
    },
    {
      name: 'Community Votes',
      url: '/organizations/community',
      icon: BadgeCheck,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
