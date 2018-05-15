import { Chance } from 'chance';

export class RandomFactory {
	constructor(seed) {
		this._chance = new Chance(seed);
	}

	nextFloatRange(start, end) {
		return this._chance.floating({min: start, max:end});
	}
	nextIntRange(start, end) {
		return this._chance.integer({min: start, max: end });
	}
}
