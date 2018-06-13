import { test, module } from 'qunit';
import { GetBits } from 'binary.js';

module('testBinary.js');

test('GetBits', (assert) => {
	assert.deepEqual(GetBits(0), [false]);
	assert.deepEqual(GetBits(1), [true]);
	assert.deepEqual(GetBits(2), [false, true]);
	assert.deepEqual(GetBits(3), [true, true]);
	assert.deepEqual(GetBits(4), [false, false, true]);
	assert.throws(GetBits(-1), Error);
});
