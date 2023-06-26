import { describe, expect, it } from 'vitest';
import {
  booleanConfigSchema,
  configDescriptionSchema,
  configLabelSchema,
  dateConfigSchema,
  descriptionSchema,
  enumConfigSchema,
  httpMethodSchema,
  jsonSchema,
  labelSchema,
  numberConfigSchema,
  outputSchema,
  sampleSchema,
  semanticVersionSchema,
  stringConfigSchema,
  uniqueNameSchema,
  urlSchema,
} from '../src/schema';

interface Entry {
  v: any;
  r: boolean;
}

type Table = Entry[];

describe('schema', () => {
  it('validates json', () => {
    const t: Table = [
      {
        v: 'string',
        r: true,
      },
      {
        v: 1,
        r: true,
      },
      {
        v: false,
        r: true,
      },
      {
        v: null,
        r: true,
      },
      {
        v: { a: 1 },
        r: true,
      },
      {
        v: [{ a: 1 }],
        r: true,
      },
      {
        v: [1],
        r: true,
      },
      {
        v: new Date(),
        r: false,
      },
    ];
    for (const e of t) {
      expect(jsonSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates sample', () => {
    const t: Table = [
      {
        v: { a: 1, b: { a: 1, b: 2 }, c: [1] },
        r: true,
      },
    ];
    for (const e of t) {
      expect(sampleSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates semantic version', () => {
    const t: Table = [
      {
        v: '0',
        r: false,
      },
      {
        v: '0.0',
        r: false,
      },
      {
        v: '0+123',
        r: false,
      },
      {
        v: '0.0.0',
        r: false,
      },
      {
        v: '0.0.1',
        r: true,
      },
      {
        v: '0.1.1',
        r: true,
      },
      {
        v: '1.1.1',
        r: true,
      },
      {
        v: '012.0.1',
        r: false,
      },
      {
        v: '10.10.10',
        r: true,
      },
    ];
    for (const e of t) {
      expect(semanticVersionSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates unique name', () => {
    const t: Table = [
      {
        v: '',
        r: false,
      },
      {
        v: 'a',
        r: false,
      },
      {
        v: '____',
        r: false,
      },
      {
        v: '0123',
        r: false,
      },
      {
        v: 'send-email',
        r: true,
      },
      {
        v: 'send_email',
        r: false,
      },
    ];
    for (const e of t) {
      expect(uniqueNameSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates label', () => {
    const t: Table = [
      {
        v: '',
        r: false,
      },
      {
        v: 'a',
        r: false,
      },
      {
        v: '____',
        r: false,
      },
      {
        v: '0123',
        r: false,
      },
      {
        v: 'send-email',
        r: true,
      },
      {
        v: 'send_email',
        r: true,
      },
      {
        v: 'Send Email',
        r: true,
      },
    ];
    for (const e of t) {
      expect(labelSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates description', () => {
    const t: Table = [
      {
        v: 'a',
        r: false,
      },
      {
        v: 'a'.repeat(4),
        r: true,
      },
      {
        v: 'a'.repeat(1025),
        r: false,
      },
    ];
    for (const e of t) {
      expect(descriptionSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates http method', () => {
    const t: Table = [
      {
        v: 'POST',
        r: true,
      },
      {
        v: 'post',
        r: true,
      },
      {
        v: 'PUT',
        r: true,
      },
      {
        v: 'put',
        r: true,
      },
      {
        v: 'GET',
        r: true,
      },
      {
        v: 'get',
        r: true,
      },
      {
        v: 'DELETE',
        r: true,
      },
      {
        v: 'delete',
        r: true,
      },
      {
        v: 'HEAD',
        r: true,
      },
      {
        v: 'head',
        r: true,
      },
      {
        v: 'PATCH',
        r: true,
      },
      {
        v: 'patch',
        r: true,
      },
    ];
    for (const e of t) {
      expect(httpMethodSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates url', () => {
    const t: Table = [
      {
        v: 'http://a.com',
        r: true,
      },
      {
        v: '123',
        r: false,
      },
    ];
    for (const e of t) {
      expect(urlSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates config label', () => {
    const t: Table = [
      {
        v: '',
        r: false,
      },
      {
        v: 'a'.repeat(2),
        r: true,
      },
      {
        v: 'a'.repeat(129),
        r: false,
      },
    ];
    for (const e of t) {
      expect(configLabelSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates config description', () => {
    const t: Table = [
      {
        v: '',
        r: false,
      },
      {
        v: 'a'.repeat(2),
        r: true,
      },
      {
        v: 'a'.repeat(1025),
        r: false,
      },
    ];
    for (const e of t) {
      expect(configDescriptionSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates string config', () => {
    const t: Table = [
      {
        v: { name: 'name', label: 'label', type: 'string' },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'string', optional: true },
        r: true,
      },
    ];
    for (const e of t) {
      expect(stringConfigSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates number config', () => {
    const t: Table = [
      {
        v: { name: 'name', label: 'label', type: 'number' },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'number', optional: true },
        r: true,
      },
    ];
    for (const e of t) {
      expect(numberConfigSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates date config', () => {
    const t: Table = [
      {
        v: { name: 'name', label: 'label', type: 'date' },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'date', optional: true },
        r: true,
      },
    ];
    for (const e of t) {
      expect(dateConfigSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates enum config', () => {
    const t: Table = [
      {
        v: { name: 'name', label: 'label', type: 'enum', values: ['a', 'b'] },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'enum', values: ['a', 'b'], optional: true },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'enum', values: ['a'], optional: true },
        r: false,
      },
    ];
    for (const e of t) {
      expect(enumConfigSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates boolean config', () => {
    const t: Table = [
      {
        v: { name: 'name', label: 'label', type: 'boolean' },
        r: true,
      },
      {
        v: { name: 'name', label: 'label', type: 'boolean', optional: true },
        r: true,
      },
    ];
    for (const e of t) {
      expect(booleanConfigSchema.safeParse(e.v).success).toBe(e.r);
    }
  });

  it('validates output schema', () => {
    const t: Table = [
      {
        v: { type: 'object', properties: { a: { type: 'string' } } },
        r: true,
      },
      {
        v: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'number' } } },
        r: true,
      },
      {
        v: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'object', properties: { c: { type: 'number' } } } },
        },
        r: true,
      },
      {
        v: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'array', items: { type: 'string' } } },
        },
        r: true,
      },
      {
        v: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
        r: true,
      },
    ];
    for (const e of t) {
      expect(outputSchema.safeParse(e.v).success).toBe(e.r);
    }
  });
});
