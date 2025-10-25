/**
 * Voting Polls Filters Component
 *
 * Provides filtering capabilities for voting polls:
 * - Search by title/description (with debouncing)
 * - Sort by multiple fields
 * - Sort order (ASC/DESC)
 * - Filter by active status
 *
 * Uses centralized filter state management via useVotingPollsFilters
 */
import { ArrowDownAZ, ArrowUpAZ, Search, X } from 'lucide-react';
import { useDebounce } from 'rooks';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { SortOrder } from '~/lib/api/api.interface';
import { PollSortBy } from '~/lib/api/poll/poll.interface';

import { useEffect, useState } from 'react';

import { useVotingPollsFilters } from '../hooks/use-voting-polls-filters';

/**
 * Sort options with user-friendly labels
 */
const SORT_OPTIONS = [
  { value: PollSortBy.CREATED_AT, label: 'Created Date' },
  { value: PollSortBy.TITLE, label: 'Title' },
  { value: PollSortBy.START_DATE, label: 'Start Date' },
  { value: PollSortBy.END_DATE, label: 'End Date' },
] as const;

export function VotingPollsFilters() {
  // Use centralized filter state management
  const { filters, setFilters, resetFilters, toggleSortOrder, hasActiveFilters } =
    useVotingPollsFilters();

  // Local state for search input with debouncing
  const [searchInput, setSearchInput] = useState(filters.q);

  // Debounce search input to avoid excessive API calls
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ q: value });
  }, 500);

  // Update local search state when URL changes (e.g., on clear)
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Search by title or description..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sort By Select */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ sortBy: value as PollSortBy })}
            >
              <SelectTrigger id="sortBy" className="w-full">
                <SelectValue placeholder="Select sort field" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order + Active Filter Container */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            {/* Sort Order Button */}
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="w-full justify-start"
                type="button"
              >
                {filters.order === SortOrder.ASC ? (
                  <>
                    <ArrowUpAZ className="mr-2 h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filter - Separate Row for Better Visibility */}
        {/* <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
              Active Polls Only
            </Label>
            <p className="text-sm text-muted-foreground">
              Show only voting polls that are currently active
            </p>
          </div>
          <Switch
            id="isActive"
            checked={filters.isActive}
            onCheckedChange={(checked) => setFilters({ isActive: checked })}
          />
        </div> */}
      </div>
    </Card>
  );
}
