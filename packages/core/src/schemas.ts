import { z } from 'zod';

const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literal>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(jsonSchema), z.record(jsonSchema)])
);

export const contextSchema = z.object({
  environment: z.record(z.string()),
});

export type Context = z.infer<typeof contextSchema>;

const semanticVersionSchema = z.string().regex(/^0|[1-9][0-9]*\.0|[1-9][0-9]*\.[1-9][0-9]*$/);

const uniqueNameSchema = z
  .string()
  .min(4)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

const descriptionSchema = z.string().max(1024);

const httpMethodSchema = z.enum(['POST', 'PUT', 'GET', 'DELETE']);

const urlSchema = z.string().url();

const visualConfigurationSchema = z
  .object({
    name: z
      .string()
      .min(2)
      .regex(/^[a-zA-Z][a-zA-Z0-9\-]$/)
      .max(64),
    helpText: z.string().min(2).max(1024).optional(),
  })
  .strict();

const httpRequestSchema = z
  .object({
    url: urlSchema,
    method: httpMethodSchema,
    body: jsonSchema.optional(),
    querystring: z.record(z.string()).optional(),
    headers: z.record(z.string()).optional(),
  })
  .strict();

const authorizerRetrieverSchema = z.function().args(contextSchema).returns(z.string().url());

const tokenRetrieverSchema = z
  .function()
  .args(contextSchema)
  .returns(
    z.promise(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
      })
    )
  );

const idRetrieverSchema = z.function().args(contextSchema, z.string()).returns(z.promise(z.string()));

export const basicAuthenticationSchema = z
  .object({
    type: z.literal('basic'),
  })
  .strict();

export const oauth1AuthenticationSchema = z
  .object({
    type: z.literal('oauth1'),
    authorize: z.union([urlSchema, authorizerRetrieverSchema]),
    getAccessToken: z.union([httpRequestSchema, tokenRetrieverSchema]),
    refreshAccessToken: z.union([httpRequestSchema, tokenRetrieverSchema]),
    getMe: z.union([httpRequestSchema, idRetrieverSchema]),
    scope: z.array(z.string()).optional(),
  })
  .strict();

export const oauth2AuthenticationSchema = z
  .object({
    type: z.literal('oauth2'),
    authorize: z.union([urlSchema, authorizerRetrieverSchema]),
    getAccessToken: z.union([httpRequestSchema, tokenRetrieverSchema]),
    refreshAccessToken: z.union([httpRequestSchema, tokenRetrieverSchema]),
    getMe: z.union([httpRequestSchema, idRetrieverSchema]),
    scope: z.array(z.string()).optional(),
  })
  .strict();

export const apiKeyAuthenticationSchema = z
  .object({
    type: z.literal('api-key'),
  })
  .strict();

export const authenticationSchema = z.discriminatedUnion('type', [
  basicAuthenticationSchema,
  oauth1AuthenticationSchema,
  oauth2AuthenticationSchema,
  apiKeyAuthenticationSchema,
]);
export type BasicAuthentication = z.infer<typeof basicAuthenticationSchema>;
export type OAuth1Authentication = z.infer<typeof oauth1AuthenticationSchema>;
export type OAuth2Authentication = z.infer<typeof oauth2AuthenticationSchema>;
export type ApiKeyAuthentication = z.infer<typeof apiKeyAuthenticationSchema>;
export type Authentication = z.infer<typeof authenticationSchema>;

export const resourceSchema = z
  .object({
    name: uniqueNameSchema,
    description: descriptionSchema.optional(),
    mock: jsonSchema,
  })
  .strict();
export type Resource = z.infer<typeof resourceSchema>;

export const triggerSchema = z
  .object({
    name: uniqueNameSchema,
    description: descriptionSchema.optional(),
    mock: jsonSchema,
    visualConfiguration: visualConfigurationSchema,
  })
  .strict();
export type Trigger = z.infer<typeof triggerSchema>;

export const jobSchema = z
  .object({
    name: uniqueNameSchema,
    description: descriptionSchema.optional(),
    mock: jsonSchema,
    visualConfiguration: visualConfigurationSchema,
  })
  .strict();
export type Job = z.infer<typeof jobSchema>;

export const featureFlagsSchema = z.object({}).strict();
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

export const integrationSchema = z
  .object({
    name: uniqueNameSchema,
    description: descriptionSchema.optional(),
    version: semanticVersionSchema,
    authentication: authenticationSchema.optional(),
    resources: z.array(resourceSchema),
    triggers: z.array(triggerSchema),
    jobs: z.array(jobSchema),
    featureFlags: featureFlagsSchema.optional(),
  })
  .strict();
export type Integration = z.infer<typeof integrationSchema>;
