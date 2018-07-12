import { GetBits } from '/util/binary.js';

describe('/util/binary.js', () => {
	it('GetBits', () => {
		assert.deepEqual(GetBits(0), [false]);
		assert.deepEqual(GetBits(1), [true]);
		assert.deepEqual(GetBits(2), [false, true]);
		assert.deepEqual(GetBits(3), [true, true]);
		assert.throws(() => GetBits(-1), /unsigned/i);
	});
});

