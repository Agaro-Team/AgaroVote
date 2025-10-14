import { voteService } from '~/lib/api/vote/vote.service';

import { mutationOptions } from '@tanstack/react-query';

export const castVoteMutationOptions = mutationOptions({
  mutationFn: voteService.castVote,
});
