import { pollService } from '~/lib/api/poll/poll.service';

import { mutationOptions } from '@tanstack/react-query';

import { queryClient } from '../config';
import { pollQueryKeys } from './queries';

export const createPollMutationOptions = mutationOptions({
  mutationFn: pollService.createPoll,
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: pollQueryKeys.activeList() });
  },
});
