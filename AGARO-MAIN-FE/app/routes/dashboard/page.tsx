import { ArrowUpRight, CheckCircle2, Coins, Plus, Shield, TrendingUp, Vote } from 'lucide-react';
import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';

export default function DashboardPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 flex-1">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">AgaroVote</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Votes Cast</h3>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">+2,350 this month</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active Voting Polls</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 new polls today</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Rewards Earned</h3>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">1,284 AGR</div>
              <p className="text-xs text-muted-foreground">+156 AGR this week</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Verified On-Chain</h3>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">All votes immutable</p>
            </div>
          </Card>
        </div>

        {/* Create Poll CTA */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Create Your Own Voting Poll</h3>
              <p className="text-sm text-muted-foreground">
                Launch a decentralized voting poll on the blockchain in minutes. Perfect for
                communities, DAOs, and organizations.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link to="/dashboard/voting-polls/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Poll
              </Link>
            </Button>
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Active Voting Polls</h3>
                <p className="text-sm text-muted-foreground">
                  3 polls you can participate in right now
                </p>
              </div>
              <a
                href="/voting-polls/active"
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: 'National Budget Allocation 2025',
                  votes: 45231,
                  percentage: 78,
                  status: 'Voting',
                  ends: '2 days left',
                },
                {
                  title: 'DAO Treasury Management Proposal',
                  votes: 12847,
                  percentage: 65,
                  status: 'Voting',
                  ends: '5 days left',
                },
                {
                  title: 'Community Feature Roadmap Q2',
                  votes: 8567,
                  percentage: 45,
                  status: 'Voting',
                  ends: '1 week left',
                },
              ].map((poll, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{poll.title}</p>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {poll.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {poll.votes.toLocaleString()} votes • {poll.ends}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${poll.percentage}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{poll.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="col-span-3 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">My Voting Activity</h3>
              <p className="text-sm text-muted-foreground">Your participation overview</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Total Votes Cast</span>
                </div>
                <span className="text-sm font-bold">147</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4 text-primary" />
                  <span className="text-sm">Pending Votes</span>
                </div>
                <span className="text-sm font-bold">3</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm">Claimable Rewards</span>
                </div>
                <span className="text-sm font-bold">284 AGR</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Verified Transactions</span>
                </div>
                <span className="text-sm font-bold">147/147</span>
              </div>
              <Separator />
              <div className="pt-2">
                <a
                  href="/rewards/claim"
                  className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Claim Your Rewards
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Content Area */}
        <div className="bg-muted/50 min-h-[400px] flex-1 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Voting Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your participation trends and blockchain verification status
              </p>
            </div>
            <a
              href="/verification/explorer"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              View on Blockchain
              <Shield className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Vote className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Participation Rate</h4>
              </div>
              <p className="text-2xl font-bold">87.5%</p>
              <p className="text-xs text-muted-foreground mt-1">Above average by 12%</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Reward Earnings</h4>
              </div>
              <p className="text-2xl font-bold">1,284 AGR</p>
              <p className="text-xs text-muted-foreground mt-1">≈ $2,568 USD</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Chain Verification</h4>
              </div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-muted-foreground mt-1">All votes secured</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
