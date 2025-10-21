import { Coins, History, LayoutDashboard, Vote } from 'lucide-react';
import { NavMain } from '~/components/nav-main';
import { NavUser } from '~/components/nav-user';
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
  // teams: [
  //   {
  //     name: 'AgaroVote',
  //     logo: GalleryVerticalEnd,
  //     plan: 'Enterprise',
  //   },
  //   {
  //     name: 'Agaro Corp.',
  //     logo: AudioWaveform,
  //     plan: 'Startup',
  //   },
  //   {
  //     name: 'Demo Team',
  //     logo: Command,
  //     plan: 'Free',
  //   },
  // ],
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
        // {
        //   title: 'My Activity',
        //   url: '/dashboard/activity',
        // },
        // {
        //   title: 'Analytics',
        //   url: '/dashboard/analytics',
        // },
      ],
    },
    {
      title: 'Voting Polls',
      url: '/dashboard/voting-polls',
      icon: Vote,
      items: [
        {
          title: 'Create New',
          url: '/dashboard/voting-polls/create',
        },
        {
          title: 'Browse All',
          url: '/dashboard/voting-polls',
        },
      ],
    },
    {
      title: 'Rewards',
      url: '/dashboard/rewards/claimable',
      icon: Coins,
      items: [
        {
          title: 'Claimable',
          url: '/dashboard/rewards/claimable',
        },
        {
          title: 'Pending',
          url: '/dashboard/rewards/pending',
        },
        {
          title: 'History',
          url: '/dashboard/rewards/history',
        },
      ],
    },
    // {
    //   title: 'Verification',
    //   url: '/verification',
    //   icon: Shield,
    //   items: [
    //     {
    //       title: 'Blockchain Explorer',
    //       url: '/verification/explorer',
    //     },
    //     {
    //       title: 'Vote Verification',
    //       url: '/verification/votes',
    //     },
    //     {
    //       title: 'Transaction History',
    //       url: '/verification/transactions',
    //     },
    //   ],
    // },
    // {
    //   title: 'Documentation',
    //   url: '/docs',
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: 'Getting Started',
    //       url: '/docs',
    //     },
    //     {
    //       title: 'How to Vote',
    //       url: '/docs/voting',
    //     },
    //     {
    //       title: 'Voting Models',
    //       url: '/docs/models',
    //     },
    //     {
    //       title: 'FAQ',
    //       url: '/docs/faq',
    //     },
    //   ],
    // },
    // {
    //   title: 'Settings',
    //   url: '/settings',
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: 'Profile',
    //       url: '/settings',
    //     },
    //     {
    //       title: 'Wallet',
    //       url: '/settings/wallet',
    //     },
    //     {
    //       title: 'Notifications',
    //       url: '/settings/notifications',
    //     },
    //     {
    //       title: 'Security',
    //       url: '/settings/security',
    //     },
    //   ],
    // },
  ],
  projects: [
    // {
    //   name: 'National Election 2025',
    //   url: '/organizations/election-2025',
    //   icon: Award,
    // },
    // {
    //   name: 'DAO Governance',
    //   url: '/organizations/dao',
    //   icon: Building2,
    // },
    // {
    //   name: 'Community Votes',
    //   url: '/organizations/community',
    //   icon: BadgeCheck,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 pt-4">
          <picture>
            <source srcSet="/Logo-small.png" type="image/png" />
            <img src="/Logo-small.png" alt="AgaroVote Logo" className="h-8 w-full object-contain" />
          </picture>

          <h1 className="text-2xl text-muted-foreground dark:text-foreground font-bold">
            Agaro<span className="text-primary ">Vote</span>
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
