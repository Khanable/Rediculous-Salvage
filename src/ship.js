import { Engine, World, Bodies, Vertices, Vector } from 'matter-js';
import { Object3D, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial } from 'three';
import { Renderer } from 'render';

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

class Edge {
	constructor(p1, p2) {
		this._p1 = p1;
		this._p2 = p2;
	}

	get p1() {
		return this._p1;
	}
	get p2() {
		return this._p2;
	}
}

class Circle {

	constructor() {
		this._centreDistance = 0;
		this._numNodes = 0;
	}

	get numNodes() {
		return this._numNodes;
	}
	get centreDistance() {
		return this._centreDistance;
	}
	set centreDistance(v) {
		this._centreDistance = v;
	}
	set numNodes(v) {
		this._numNodes = v;
	}
}

export class Ship {
	constructor(randomFactory) {
		this._random = randomFactory;
		this._transform = null;

		this._inited = false;
	}

	_getCircles(settings) {
		let circles = [];
		let numCircles = this._random.nextIntRange(settings.minCircles, settings.maxCircles);
		circles = new Array(numCircles).fill(null).map( e => new Circle() );

		//Set distance
		circles.forEach( circle => {
			circle.centreDistance = this._random.nextFloatRange(settings.minCircleDistance, settings.maxCircleDistance);
		});
		//collapse duplicate circles with the same distances
		let oldCircles = circles;
		circles = [];
		for(let circle of oldCircles) {
			if ( !circles.find( e => e.centreDistance == circle.centreDistance ) ) {
				circles.push(circle);
			}
		}
		

		//Setup circle nodes
		let outerCircle = circles.reduce( (acc, cv) => {
			if ( acc == null || cv.centreDistance > acc.centreDistance ) {
				return cv;
			}
			return acc;
		}, null);
		outerCircle.numNodes = 3;
		let extraNodes = this._random.nextFloatRange(settings.minExtraNodes, settings.maxExtraNodes);
		for(let i = 0; i < extraNodes; i++) {
			let index = this._random.nextIntRange(0, circles.length-1);
			let circle = circles[index];
			circle.numNodes++;
		}

		return circles;
	}

	_getVertices(circles) {
		let rtn = [Vector.create(0, 0)];
		for(let circle of circles) {
			let thetas = [];
			for(let i = 0; i < circle.numNodes; i++) {
				let theta = this._random.nextFloatRange(0, Math.PI*2);
				if ( !thetas.includes(theta) ) {
					thetas.push(theta);
					let x = circle.centreDistance*Math.sin(theta);
					let y = circle.centreDistance*Math.cos(theta);
					rtn.push(Vector.create(x, y));
				}
			}
			circle.numNodes = thetas.length;
		}
		return rtn;
	}

	_getForward(vertices, centre) {
		let rtn = null;
		let rtnDist = null;
		let rtnSymetry = null;
		for(let vert of vertices) {
			if ( !(vert.x == 0 && vert.y == 0) ) { 
				let curForward = Vector.sub(vert, centre);
				let totals = [0, 0];
				let dist = Vector.magnitudeSquared(curForward);
				for(let compareVert of vertices) {
					if ( compareVert != vert ) {
						let toVert = Vector.sub(compareVert, centre);
						let side = Vector.cross(curForward, toVert);
						if ( side >= 0 ) {
							totals[0]++;
						}
						else {
							totals[1]++;
						}
					}
				}
				let symetry = Math.abs(totals[0] - totals[1]);
				if ( rtn == null || symetry < rtnSymetry || (symetry == rtnSymetry && dist > rtnDist) ) {
					rtn = curForward;
					rtnDist = dist;
					rtnSymetry = symetry;
				}
			}
		}
		return Vector.normalise(rtn);
	}

	_getEdges(vertices) {
		let rtn = [];
		let hull = Vertices.hull(vertices);
		let remaining = vertices.filter( e => !hull.find( h => h.x==e.x && h.y==e.y ) );

		//Wrap connect the convex hull
		for(let i = 1; i < hull.length; i++) {
			let from = hull[i-1];
			let to = hull[i];
			rtn.push(new Edge(from, to));
		}

		//Randomly join remaining.
		let numNodes = vertices.length;
		let joins = this._random.nextIntRange(0, numNodes*(numNodes-1)/2);
		for(let i = 0; i < joins; i++) {
			let fromIndex = this._random.nextIntRange(0, vertices.length-1);
			let selectList = vertices.filter( (e, i) =>  i != fromIndex );
			let toIndex = this._random.nextIntRange(0, selectList.length-1);
			rtn.push(new Edge(vertices[fromIndex], selectList[toIndex]));
		}

		return rtn;
	}

	_generateMesh(shipSettings, debug) {
		let settings = shipSettings.get();
		let circles = this._getCircles(settings);

		let vertices = this._getVertices(circles);
		let edges = this._getEdges(vertices);
		let centre = Vertices.centre(vertices);
		let forward = this._getForward(vertices, centre);

		let geometry = new BufferGeometry();
		let geometryVerts = new Float32Array(edges.length*2);
		for(let i = 0; i < edges.length; i++) {
			let edge = edges[i];
			for(let j = 0; j < 2; j++) {
				let vertIndex = (i*2)+j;
				vertIndex*=3;
				let point = edge.p1;
				if ( j >= 1 ) {
					point = edge.p2;
				}
				geometryVerts[vertIndex] = point.x;
				geometryVerts[vertIndex+1] = point.y;
				geometryVerts[vertIndex+2] = 0;
			}
		}
		geometry.addAttribute('position', new BufferAttribute(geometryVerts, 3));
		let material = new LineBasicMaterial({
			color: 0xffffff,
			linewidth: 1,
		});
		this._transform = new LineSegments( geometry, material );

		//?setup transform for object centre and forward.

		if ( debug != undefined ) {
			debug.vertices = vertices;
			debug.edges = edges;
			debug.centre = centre;
			debug.forward = forward;
			Object.freeze(debug);
		}
	}

	init(shipSettings) {
		if ( !this._inited ) { 
			this._generateMesh(shipSettings);
			this._transform = Renderer.add(this._transform);
		}
		else {
			throw new Error('Already Inited');
		}
	}

	get inited() {
		return this._inited;
	}

}
