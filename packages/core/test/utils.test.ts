import { describe, expect, it } from 'vitest';
import { Json } from '../src/schema';
import { camelize, filterKeys } from '../src/';

interface JsonEntry {
  v: Json;
  r: Json;
}

type JsonTable = JsonEntry[];

interface FilterEntry {
  v: any;
  k: string[];
  r: any;
}

type FilterTable = FilterEntry[];

describe('utils', () => {
  it('converts json properties to camel case', () => {
    const t: JsonTable = [
      {
        v: 'string',
        r: 'string',
      },
      {
        v: 0,
        r: 0,
      },
      {
        v: true,
        r: true,
      },
      {
        v: null,
        r: null,
      },
      {
        v: [0, 1],
        r: [0, 1],
      },
      {
        v: { a: 1, b: [1] },
        r: { a: 1, b: [1] },
      },
      {
        v: { Abc: 0, a_b_c: 1, c_b_a: { a_a: { b_b: 1 } } },
        r: { abc: 0, aBC: 1, cBA: { aA: { bB: 1 } } },
      },
    ];
    for (const e of t) {
      expect(camelize(e.v)).toEqual(e.r);
    }
  });

  it('filters by key', () => {
    const t: FilterTable = [
      {
        v: { a: 1 },
        k: ['a'],
        r: { a: 1 },
      },
      {
        v: { a: 1 },
        k: ['b'],
        r: {},
      },
      {
        v: { a: 1, b: 2 },
        k: ['a'],
        r: { a: 1 },
      },
      {
        v: { a: 1, b: 2, c: 3 },
        k: ['a', 'b'],
        r: { a: 1, b: 2 },
      },
    ];
    for (const e of t) {
      expect(filterKeys(e.v, e.k)).toEqual(e.r);
    }
  });
});
