import { z } from 'zod';

const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literal>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(jsonSchema), z.record(jsonSchema)])
);

export const sampleSchema = z.record(jsonSchema);

export const semanticVersionSchema = z.union([
  z.string().regex(/^0\.(0|[1-9][0-9]*)\.[1-9][0-9]*$/),
  z.string().regex(/^[1-9][0-9]*\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/),
]);

export const uniqueNameSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9\-]*$/);

export const labelSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_\-\s]*$/);

export const descriptionSchema = z.string().min(4).max(1024);

export const httpMethodSchema = z.enum([
  'POST',
  'post',
  'PUT',
  'put',
  'GET',
  'get',
  'DELETE',
  'delete',
  'HEAD',
  'head',
  'PATCH',
  'patch',
]);

export const urlSchema = z.string().url();

export const configNameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9\-]*$/);

export const configLabelSchema = z
  .string()
  .min(2)
  .max(128)
  .regex(/^[a-zA-Z][a-zA-Z0-9\-]*$/);
export const configDescriptionSchema = z.string().min(2).max(1024);

export const stringConfigSchema = z
  .object({
    name: configNameSchema,
    label: configLabelSchema.optional(),
    description: configDescriptionSchema.optional(),
    type: z.literal('string'),
    maxLength: z.number().int().optional(),
    minLength: z.number().int().optional(),
    email: z.boolean().optional(),
    url: z.boolean().optional(),
    uuid: z.boolean().optional(),
    ulid: z.boolean().optional(),
    ip: z.boolean().optional(),
    color: z.boolean().optional(),
    cron: z.boolean().optional(),
    optional: z.boolean().optional(),
    expression: z.boolean().optional(),
  })
  .strict();

export const numberConfigSchema = z
  .object({
    name: configNameSchema,
    label: configLabelSchema.optional(),
    description: configDescriptionSchema.optional(),
    type: z.literal('number'),
    gt: z.number().optional(),
    lt: z.number().optional(),
    gte: z.number().optional(),
    lte: z.number().optional(),
    integer: z.boolean().optional(),
    optional: z.boolean().optional(),
    expression: z.boolean().optional(),
  })
  .strict();

export const dateConfigSchema = z
  .object({
    name: configNameSchema,
    label: configLabelSchema.optional(),
    description: configDescriptionSchema.optional(),
    type: z.literal('date'),
    minDate: z.string().datetime().pipe(z.coerce.date()).optional(),
    maxDate: z.string().datetime().pipe(z.coerce.date()).optional(),
    optional: z.boolean().optional(),
    expression: z.boolean().optional(),
  })
  .strict();

export const enumConfigSchema = z
  .object({
    name: configNameSchema,
    label: configLabelSchema.optional(),
    description: configDescriptionSchema.optional(),
    type: z.literal('enum'),
    values: z.array(z.string()).min(2),
    optional: z.boolean().optional(),
    expression: z.boolean().optional(),
  })
  .strict();

export const booleanConfigSchema = z
  .object({
    name: configNameSchema,
    label: configLabelSchema.optional(),
    description: configDescriptionSchema.optional(),
    type: z.literal('boolean'),
    optional: z.boolean().optional(),
    expression: z.boolean().optional(),
  })
  .strict();

const scalarConfigSchema = z.discriminatedUnion('type', [
  stringConfigSchema,
  enumConfigSchema,
  booleanConfigSchema,
  numberConfigSchema,
  dateConfigSchema,
]);

export const objectConfigSchema: z.ZodType<{
  name: string;
  label?: string;
  description?: string;
  type: 'object';
  properties: any[];
  optional?: boolean;
  expression?: boolean;
}> = z.lazy(() =>
  z
    .object({
      name: configNameSchema,
      label: configLabelSchema.optional(),
      description: configDescriptionSchema.optional(),
      type: z.literal('object'),
      properties: z
        .array(z.union([scalarConfigSchema, arrayConfigSchema]))
        .min(1)
        .max(128),
      optional: z.boolean().optional(),
      expression: z.boolean().optional(),
    })
    .strict()
);

export const arrayConfigSchema: z.ZodType<{
  name: string;
  label?: string;
  description?: string;
  type: 'array';
  minLength?: number;
  maxLength?: number;
  items: any;
  optional?: boolean;
  expression?: boolean;
}> = z.lazy(() =>
  z
    .object({
      name: configNameSchema,
      label: configLabelSchema.optional(),
      description: configDescriptionSchema.optional(),
      type: z.literal('array'),
      minLength: z.number().int().optional(),
      maxLength: z.number().int().optional(),
      items: z.union([scalarConfigSchema, objectConfigSchema]),
      optional: z.boolean().optional(),
      expression: z.boolean().optional(),
    })
    .strict()
);

export const inputSchema = z.array(z.union([scalarConfigSchema, arrayConfigSchema])).max(128);
export type Input = z.infer<typeof inputSchema>;

type OutputInner =
  | { type: 'string' | 'boolean' | 'number' | 'null' | 'undefined' }
  | { type: 'array'; items: OutputInner }
  | { type: 'object'; properties: Record<string, OutputInner> }
  | { type: 'union'; types: OutputInner[] };

export type Output =
  | { type: 'array'; items: OutputInner }
  | { type: 'object'; properties: Record<string, OutputInner> };

const outputInnerSchema: z.ZodType<OutputInner> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('string') }),
    z.object({ type: z.literal('boolean') }),
    z.object({ type: z.literal('number') }),
    z.object({ type: z.literal('null') }),
    z.object({ type: z.literal('undefined') }),
    z.object({ type: z.literal('union'), types: z.array(outputInnerSchema).min(2) }),
    z.object({ type: z.literal('array'), items: outputInnerSchema }),
    z.object({ type: z.literal('object'), properties: z.record(outputInnerSchema) }),
  ])
);

export const outputSchema: z.ZodType<Output> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('array'), items: outputInnerSchema }),
    z.object({ type: z.literal('object'), properties: z.record(outputInnerSchema) }),
  ])
);

export const httpRequestOptionsSchema = z
  .object({
    url: urlSchema,
    method: httpMethodSchema,
    body: z.record(z.any()).optional(),
    querystring: z.record(z.string()).optional(),
    headers: z.record(z.string()).optional(),
  })
  .strict();

export const tokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const tokenWithIdSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  uniqueId: z.string(),
  expiresIn: z.number(),
  authData: z.record(z.string()),
});

export const oauth2AuthenticationSchema = z
  .object({
    type: z.literal('oauth2'),
    url: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          state: z.string(),
        })
      )
      .returns(z.string().url()),
    authorize: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          code: z.string(),
        })
      )
      .returns(z.promise(tokenWithIdSchema)),
    refresh: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          refreshToken: z.string(),
        })
      )
      .returns(z.promise(tokenSchema)),
    me: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string(),
        })
      )
      .returns(z.promise(z.string())),
    label: z
      .function()
      .args(z.object({ accessToken: z.string(), authData: z.record(z.string()) }))
      .returns(z.string().min(1))
      .optional(),
  })
  .strict();

export const apiKeyAuthenticationSchema = z
  .object({
    type: z.literal('api-key'),
    label: z
      .function()
      .args(z.object({ apiKey: z.string(), authData: z.record(z.string()) }))
      .returns(z.string().min(1))
      .optional(),
  })
  .strict();

export const authenticationSchema = z.discriminatedUnion('type', [
  oauth2AuthenticationSchema,
  apiKeyAuthenticationSchema,
]);
export type Authentication = z.infer<typeof authenticationSchema>;

export const resourceSchema = z
  .object({
    name: uniqueNameSchema,
    sample: sampleSchema,
    output: outputSchema,
    handle: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
        })
      )
      .returns(z.promise(z.any())),
  })
  .strict();
export type Resource = z.infer<typeof resourceSchema>;

const pollTriggerSchema = z
  .object({
    name: uniqueNameSchema,
    label: labelSchema.optional(),
    description: descriptionSchema.optional(),
    type: z.literal('poll'),
    sample: sampleSchema,
    input: inputSchema,
    output: outputSchema,
    handle: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
          snapshot: z.array(z.string()).optional(),
          dry: z.boolean().optional(),
        })
      )
      .returns(z.promise(z.object({ snapshot: z.array(z.string()), delta: z.array(z.any()) }))),
    uniqueId: z
      .function()
      .args(
        z.object({
          eventId: z.string(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
        })
      )
      .returns(z.string()),
  })
  .strict();

const webhookTriggerSchema = z
  .object({
    name: uniqueNameSchema,
    label: labelSchema.optional(),
    description: descriptionSchema.optional(),
    type: z.literal('webhook'),
    sample: sampleSchema,
    input: inputSchema,
    output: outputSchema,
    handle: z
      .function()
      .args(
        z.object({
          payload: z.object({
            body: z.string().optional(),
            headers: z.record(z.string()).optional(),
          }),
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
          triggerContext: z.record(z.any()),
          history: z.array(z.string()).optional(),
        })
      )
      .returns(z.promise(z.any())),
    uniqueId: z
      .function()
      .args(
        z.object({
          eventId: z.string(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
        })
      )
      .returns(z.string()),
    createHook: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
          triggerId: z.string(),
        })
      )
      .returns(z.promise(z.any()))
      .optional(),
    deleteHook: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
          triggerContext: z.record(z.any()),
        })
      )
      .optional(),
  })
  .strict();

export const triggerSchema = z.discriminatedUnion('type', [pollTriggerSchema, webhookTriggerSchema]);
export type Trigger = z.infer<typeof triggerSchema>;

export const actionSchema = z
  .object({
    name: uniqueNameSchema,
    label: labelSchema.optional(),
    description: descriptionSchema.optional(),
    sample: sampleSchema,
    input: inputSchema,
    output: outputSchema,
    handle: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
        })
      )
      .returns(z.promise(z.any())),
  })
  .strict();
export type Action = z.infer<typeof actionSchema>;

export const injectionSchema = z
  .object({
    name: uniqueNameSchema,
    label: labelSchema.optional(),
    description: descriptionSchema.optional(),
    sample: sampleSchema,
    input: inputSchema,
    output: outputSchema,
    handle: z
      .function()
      .args(
        z.object({
          env: z.record(z.string()),
          accessToken: z.string().optional(),
          apiKey: z.string().optional(),
          authData: z.record(z.string()),
          input: z.record(z.any()),
        })
      )
      .returns(z.promise(z.any())),
  })
  .strict();
export type Injections = z.infer<typeof injectionSchema>;

export const integrationSchema = z
  .object({
    name: uniqueNameSchema,
    displayName: labelSchema.optional(),
    description: descriptionSchema.optional(),
    version: semanticVersionSchema,
    authentication: authenticationSchema.optional(),
    resources: z.array(resourceSchema),
    triggers: z.array(triggerSchema),
    actions: z.array(actionSchema),
    injections: z.array(injectionSchema),
  })
  .strict();
export type Integration = z.infer<typeof integrationSchema>;

interface DryResource {
  name: z.infer<typeof uniqueNameSchema>;
  sample: z.infer<typeof sampleSchema>;
  output: z.infer<typeof outputSchema>;
}

interface DryTrigger {
  name: z.infer<typeof uniqueNameSchema>;
  label?: z.infer<typeof labelSchema>;
  description?: z.infer<typeof descriptionSchema>;
  type: 'poll' | 'webhook';
  sample: z.infer<typeof sampleSchema>;
  input: z.infer<typeof inputSchema>;
  output: z.infer<typeof outputSchema>;
}

interface DryAction {
  name: z.infer<typeof uniqueNameSchema>;
  label?: z.infer<typeof labelSchema>;
  description?: z.infer<typeof descriptionSchema>;
  sample: z.infer<typeof sampleSchema>;
  input: z.infer<typeof inputSchema>;
  output: z.infer<typeof outputSchema>;
}

interface DryInjection {
  name: z.infer<typeof uniqueNameSchema>;
  label?: z.infer<typeof labelSchema>;
  description?: z.infer<typeof descriptionSchema>;
  sample: z.infer<typeof sampleSchema>;
  input: z.infer<typeof inputSchema>;
  output: z.infer<typeof outputSchema>;
}

export interface DryIntegration {
  name: z.infer<typeof uniqueNameSchema>;
  displayName?: z.infer<typeof labelSchema>;
  description?: z.infer<typeof descriptionSchema>;
  version: z.infer<typeof semanticVersionSchema>;
  authentication?: { type: 'api-key' } | { type: 'oauth2' };
  resources: DryResource[];
  triggers: DryTrigger[];
  actions: DryAction[];
  injections: DryInjection[];
}
