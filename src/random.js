import { Chance } from 'chance';

export class RandomFactory {
	constructor(seed) {
		if ( seed == undefined ) {
			seed = 0;
		}
		this._chance = new Chance(seed);
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
