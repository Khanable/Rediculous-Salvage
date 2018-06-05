import { Vector } from 'matter-js';

export const AngleBetween = function(v1, v2) {
	let n1 = Vector.normalise(v1);
	let n2 = Vector.normalise(v2);
	let dot = Vector.dot(n1, n2);
	return Math.acos(dot);
}

export const AngleBetweenSigned = function(v1, v2) {
	let zero = Vector.create(0, 0);
	return Vector.angle(zero, v1)-Vector.angle(zero, v2)
}
