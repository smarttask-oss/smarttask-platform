import axios from 'axios';
import { z } from 'zod';
import { httpRequestOptionsSchema } from './schema';

export const request = async <T>(options: z.infer<typeof httpRequestOptionsSchema>): Promise<T> => {
  const { data } = await axios.request<T>({
    url:
      options.querystring === undefined
        ? options.url
        : `${options.url}?${new URLSearchParams(options.querystring).toString()}`,
    method: options.method,
    data: options.body,
    headers: options.headers,
  });
  return data;
};
