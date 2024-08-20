import { sum } from './sum';
import { describe, it, expect, beforeEach, test } from 'vitest';

test('basic', () => {
  expect(sum()).toBe(0);
});

test('basic again', () => {
  expect(sum(1, 2)).toBe(3);
});