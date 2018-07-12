import { Vector as MatterVector } from 'matter-js';
import { Vector3 as ThreeVector } from 'three';

export class Vector2 {
	constructor(x, y) {
		this._x = x;
		this._y = y;
	}

	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}

	mag() {
		return MatterVector.magnitude(this);
	}
	angle(v) {
		let n1 = MatterVector.normalise(this);
		let n2 = MatterVector.normalise(v);
		let dot = MatterVector.dot(n1, n2);
		return Math.acos(dot);
	}
	angleSigned(v) {
		let zero = MatterVector.create(0, 0);
		return MatterVector.angle(zero, v1)-MatterVector.angle(zero, v2);
	}

	toMatter() {
		return MatterVector.create(this._x, this._y);
	}
	toThree(z) {
		return new ThreeVector(this._x, this._y, z);
	}
	add(v) {
		return Vector2.from(MatterVector.add(this, v));
	}
	sub(v) {
		return Vector2.from(MatterVector.sub(this, v));
	}
	mul(s) {
		return Vector2.from(MatterVector.mult(this, s));
	}
	div(s) {
		return Vector2.from(MatterVector.div(this, s));
	}

	static from(v) {
		return new Vector2(v.x, v.y);
	}
}
Object.defineProperty(Vector2, 'zero', { value: new Vector2(0, 0), writeable: false, enumable: true });
Object.defineProperty(Vector2, 'one', { value: new Vector2(1, 1), writeable: false, enumable: true });
