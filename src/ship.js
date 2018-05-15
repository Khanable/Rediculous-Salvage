import { Engine, World, Bodies, Vertices, Vector } from 'matter-js';
import { Object3D } from 'three';

export class ShipSettings {
	constructor() {
		this._minCircles = 1;
		this._maxCircles = 4;
		this._minCircleDistance = 1;
		this._maxCircleDistance = 3;
		this._minExtraNodes = 1;
		this._maxExtraNodes = 5;
	}

	set(changes) {
		let toPrivate = Object.keys(changes).map( e => Object.freeze({
			privateName: '_'+e,
			publicName: e,
			value: changes[e],
		}));
		toPrivate.forEach( e => {
			if ( this[e.privateName] ) {
				this[e.privateName] = e.value;
			}
			else {
				throw new Error('Unknown property: '+e.publicName);
			}
		});
	}

	get() {
		let rtn = {};
		let toPublic = Object.keys(this).forEach( e => rtn[e.slice(1)] = this[e] );
		return Object.freeze(rtn);
	}
}

export class Ship {
	constructor(randomFactory) {
		this._random = randomFactory;
		this._setup = false;
	}

	_getCircleSettings(settings) {
		let rtn = {};
		let numCircles = this._random.nextFloatRange(settings.minCircles, settings.maxCircles);
		rtn.circles = new Array(numCircles).map( e => Object.seal({
			centreDistance: 0;
			numNodes: 0;
		}));

		//Set distance
		rtn.circles.forEach( circle => {
			circle.centreDistance = this._random.nextFloatRangeNoOverlap(settings.minCircleDistance, settings.maxCircleDistance, rtn.circles, e => e.centreDistance);
		});

		//Setup circle nodes
		let outerCircle = rtn.circles.reduce( (acc, cv) => {
			if ( cv.centreDistance > acc.centreDistance ) {
				acc = cv;
			}
		});
		outerCircle.numNodes = 3;
		let extraNodes = this._random.nextFloatRange(settings.minExtraNodes, settings.maxExtraNodes);
		for(let i = 0; i < extraNodes; i++) {
			let circle = rtn.circles[this._random.nextIntRange(0, rtn.circles.length)];
			circle.numNodes++;
		}

		return rtn;
	}

	_getVertices(circleSettings) {
		let rtn = [Vector.create(0, 0)];
		for(let circle of circleSettings) {
			
		}
	}

	create(shipSettings) {
		let settings = shipSettings.get();
		let circleSettings = this._getCircleSettings(settings);

		let vertices = this._getVertices(circleSettings);
	}

}
