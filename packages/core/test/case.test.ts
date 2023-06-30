import { describe, expect, it } from 'vitest';
import { Integration, integrationSchema } from '../src/schema';
import { request } from '../src/utils';

const fakeConstructEvent = (_body: string, _sig: string, _secret: string) => ({ type: '', data: {} });
const fakeCreateWebhook = async (_triggerId: string) => ({ id: 'id', secret: 'secret' });
const fakeDeleteWebhook = async (_id: string) => true;

describe('case', () => {
  it('stripe demo case', () => {
    const integration: Integration = {
      name: 'Stripe',
      version: '1.0.0',
      authentication: {
        type: 'api-key',
        label: _c => 'Generated',
      },
      resources: [],
      injections: [],
      triggers: [
        {
          type: 'webhook',
          name: 'new-customer',
          label: 'New Customer',
          description: 'Triggers when a new customer is created',
          sample: {},
          input: [],
          output: {
            type: 'object',
            properties: {},
          },
          handle: async c => {
            if (!c.payload.body || !c.payload.headers) return null;
            const sig = c.payload.headers['stripe-signature'];
            if (!sig) return null;
            try {
              const e = fakeConstructEvent(c.payload.body, sig, c.triggerContext.secret);
              if (e.type !== 'customer.created') return null;
              return e.data;
            } catch {
              return null;
            }
          },
          uniqueKey: c => ({ eventId: c.eventId, connectionId: c.authData.connectionId }),
          createHook: async c => {
            return await fakeCreateWebhook(c.triggerId);
          },
          deleteHook: async c => {
            await fakeDeleteWebhook(c.triggerContext.id);
          },
        },
      ],
      actions: [],
    };
    const result = integrationSchema.safeParse(integration);
    expect(result.success).toBeTruthy();
  });
  it('github demo case', () => {
    const integration: Integration = {
      name: 'Github',
      version: '1.0.0',
      authentication: {
        type: 'oauth2',
        url: context => {
          return `https://github.com/login/oauth/authorize?${new URLSearchParams({
            client_id: context.env.CLIENT_ID,
            allow_signup: 'false',
            redirect_uri: 'https://service.smarttaskapp.com/callback/github',
            state: context.state,
          }).toString()}`;
        },
        authorize: async context => {
          const tokenResponse = await request<{
            access_token: string;
            refresh_token: string;
            expires_in: number;
          }>({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            body: {
              client_id: context.env.CLIENT_ID,
              client_secret: context.env.CLIENT_SECRET,
              code: context.code,
              redirect_uri: 'https://service.smarttaskapp.com/callback/github',
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          });
          const meResponse = await request<{ id: number; email: string }>({
            url: 'https://api.github.com/user',
            method: 'GET',
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });
          return {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresIn: tokenResponse.expires_in,
            uniqueId: meResponse.id.toString(),
            authData: {
              id: meResponse.id.toString(),
              email: meResponse.email,
            },
          };
        },
        refresh: async context => {
          const response = await request<{ access_token: string; expires_in: number; refresh_token: string }>(
            {
              url: 'https://github.com/login/oauth/access_token',
              method: 'POST',
              body: {
                client_id: context.env.CLIENT_ID,
                client_secret: context.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: context.refreshToken,
              },
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
          return {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresIn: response.expires_in,
          };
        },
        me: async context => {
          const response = await request<{ id: number; email: string }>({
            url: 'https://api.github.com/user',
            method: 'GET',
            headers: {
              Authorization: `Bearer ${context.accessToken}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });
          return response.id.toString();
        },
        label: context => {
          return context.authData.email as string;
        },
      },
      resources: [],
      injections: [],
      triggers: [
        {
          type: 'webhook',
          name: 'new-commit',
          label: 'New Commit',
          description: 'Triggers when a new commit is created',
          sample: {},
          input: [
            {
              type: 'string',
              name: 'repository',
            },
          ],
          output: {
            type: 'object',
            properties: {},
          },
          handle: async c => {
            if (!c.payload.body || !c.payload.headers) return null;
            const sig = c.payload.headers['stripe-signature'];
            if (!sig) return null;
            try {
              const e = fakeConstructEvent(c.payload.body, sig, c.triggerContext.secret);
              if (e.type !== 'customer.created') return null;
              return e.data;
            } catch {
              return null;
            }
          },
          uniqueKey: c => ({
            eventId: c.eventId,
            connectionId: c.authData.connectionId,
            repository: c.input.repository,
          }),
          createHook: async c => {
            return await fakeCreateWebhook(c.triggerId);
          },
          deleteHook: async c => {
            await fakeDeleteWebhook(c.triggerContext.id);
          },
        },
        {
          type: 'poll',
          name: 'new-repo',
          label: 'New Repository',
          sample: {},
          input: [],
          output: {
            type: 'object',
            properties: {},
          },
          uniqueKey: c => ({ eventId: c.eventId, connectionId: c.authData.connectionId }),
          handle: async c => {
            return { snapshot: [], delta: [] };
          },
        },
      ],
      actions: [],
    };
    const result = integrationSchema.safeParse(integration);
    expect(result.success).toBeTruthy();
  });
});
