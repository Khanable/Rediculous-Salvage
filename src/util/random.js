import { Chance } from 'chance';

export class RandomFactory {
	constructor(seed) {
		if ( seed == undefined ) {
			seed = 0;
		}

		this._seed = seed;

		this._chance = new Chance(seed);
	}

	get inspec_seed() {
		return this._seed;
	}

	//start inclusive, end inclusive.
	nextFloatRange(start, end) {
		return this._chance.floating({min: start, max:end});
	}
	//start inclusive, end inclusive.
	nextIntRange(start, end) {
		return this._chance.integer({min: start, max: end});
	}
}
