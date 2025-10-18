import { parseAsStringEnum, useQueryState } from 'nuqs';

export type ActiveTab = 'claimable' | 'pending' | 'history';
export const useTabsQueryState = () => {
  return useQueryState(
    'activeTab',
    parseAsStringEnum<ActiveTab>(['claimable', 'pending', 'history']).withDefault('claimable')
  );
};
