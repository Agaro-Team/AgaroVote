import { agaroApi } from '../agaro.api.client';
import type {
  GetInvitedAddressesRequest,
  GetInvitedAddressesResponse,
} from './invited-address.interface';

export const invitedAddressService = {
  getInvitedAddresses: async (pollId: string, params: GetInvitedAddressesRequest) => {
    const response = await agaroApi.get<GetInvitedAddressesResponse>(
      `/v1/polls/${pollId}/invited-addresses`,
      { params }
    );
    return response;
  },
};
