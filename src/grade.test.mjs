import test from 'node:test';
import assert from 'node:assert/strict';
import { codeChecks, parseVerdict } from './grade.mjs';
test('missing required text fails', () => assert.equal(codeChecks({ must: ['\\$6'] }, 'It is $9').length, 1));
test('forbidden text fails', () => assert.equal(codeChecks({ mustNot: ['secret'] }, 'my SECRET').length, 1));
test('clean answer passes', () => assert.equal(codeChecks({ must: ['\\$6'], mustNot: ['secret'] }, 'It is $6').length, 0));
test('verdict must be a real boolean', () => { assert.throws(() => parseVerdict('{"pass":"true"}')); assert.throws(() => parseVerdict('looks good')); });
