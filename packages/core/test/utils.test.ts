import { describe, expect, it } from 'vitest';
import { Json } from '../src/schema';
import { camelize } from '../src/';

interface Entry {
  v: Json;
  r: Json;
}

type Table = Entry[];

describe('utils', () => {
  it('converts json properties to camel case', () => {
    const t: Table = [
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
});
