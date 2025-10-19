import dayjs from 'dayjs';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('en');

export const formatDate = (date: Date | string, format: string = 'MM/DD/YYYY') => {
  return dayjs(date).format(format);
};

export const startOfDay = (date: Date | string) => {
  return dayjs(date).startOf('day').toDate();
};

export const endOfDay = (date: Date | string) => {
  return dayjs(date).endOf('day').toDate();
};

export { dayjs };
