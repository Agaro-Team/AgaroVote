import { agaroApi } from '../agaro.api';

export const pollService = {
  createPoll: async (poll: CreatePollRequest) => {
    await agaroApi.post('/v1/polls', poll);
  },
};
