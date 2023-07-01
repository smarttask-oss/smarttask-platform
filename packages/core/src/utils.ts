import axios from 'axios';
import _ from 'lodash';
import { z } from 'zod';
import { DryIntegration, Integration, Json, httpRequestOptionsSchema } from './schema';

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

export const dehydrate = (integration: Integration): DryIntegration => ({
  name: integration.name,
  displayName: integration.displayName,
  description: integration.description,
  version: integration.version,
  authentication:
    integration.authentication === undefined ? undefined : { type: integration.authentication.type },
  resources: integration.resources.map(r => ({
    name: r.name,
    sample: r.sample,
    output: r.output,
  })),
  triggers: integration.triggers.map(t => ({
    name: t.name,
    label: t.label,
    description: t.description,
    type: t.type,
    sample: t.sample,
    input: t.input,
    output: t.output,
  })),
  actions: integration.actions.map(a => ({
    name: a.name,
    label: a.label,
    description: a.description,
    sample: a.sample,
    input: a.input,
    output: a.output,
  })),
  injections: integration.injections.map(i => ({
    name: i.name,
    label: i.label,
    description: i.description,
    sample: i.sample,
    input: i.input,
    output: i.output,
  })),
});

export const camelize = (obj: Json): Json => {
  if (
    typeof obj === 'string' ||
    typeof obj === 'number' ||
    typeof obj === 'boolean' ||
    typeof obj === 'undefined' ||
    obj === null
  ) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(v => camelize(v));
  }
  return _.reduce(
    obj,
    (r, v, k) => {
      return {
        ...r,
        [_.camelCase(k)]: camelize(v),
      };
    },
    {}
  );
};

export const filterKeys = (obj: any, keys: string[]): any => _.pick(obj, keys);
