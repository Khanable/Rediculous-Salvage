import { Engine, World, Bodies, Vertices, Vector } from 'matter-js';
import { Object3D, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, AxesHelper } from 'three';
import { Renderer } from 'render.js';
import { Decorate, IsInited } from 'util.js';

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
	constructor(startIndex, endIndex) {
		this._startIndex = startIndex;
		this._endIndex = endIndex;
	}

	get startIndex() {
		return this._startIndex;
	}
	get endIndex() {
		return this._endIndex;
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

	_getForward(vertices, hullEdges, centre) {
		let rtn = null;
		let rtnDist = null;
		let hullEdgeIndex = null;

		//Find furthest vert from centre
		for(let i = 0; i < hullEdges.length; i++) {
			let edge = hullEdges[i];
			let p1 = vertices[edge.startIndex];
			let linePoint = Vector.sub(p1, centre);
			let distPoint = Vector.magnitude(linePoint);

			if ( rtn == null || distPoint > rtnDist ) {
				rtn = linePoint;
				rtnDist = distPoint;
				hullEdgeIndex = i;
			}
		}

		//Consider edge midpoints on ether side of furthest vert from centre
		let edge1 = hullEdges[hullEdgeIndex];
		let pR = vertices[edge1.startIndex];
		let p1 = vertices[edge1.endIndex];
		let p2 = hullEdges.find( e => e.endIndex == edge1.startIndex ).startIndex;
		p2 = vertices[p2];

		let line1 = Vector.sub(p1, pR);
		let line2 = Vector.sub(p2, pR);
		let edge1Midpoint = Vector.add(pR, Vector.div(line1, 2));
		let edge2Midpoint = Vector.add(pR, Vector.div(line2, 2));

		let line1Mag = Vector.magnitude(line1);
		let line2Mag = Vector.magnitude(line2);
		let line1Midpoint = Vector.sub(edge1Midpoint, centre);
		let line2Midpoint = Vector.sub(edge2Midpoint, centre);
		let line1MidpointMag = Vector.magnitude(line1Midpoint);
		let line2MidpointMag = Vector.magnitude(line2Midpoint);

		let midPoint1DistAdj = line1MidpointMag+line1MidpointMag/line1Mag;
		let midPoint2DistAdj = line2MidpointMag+line2MidpointMag/line2Mag;

		if ( midPoint1DistAdj > rtnDist ) {
			rtn = line1Midpoint;
		}
		else if ( midPoint2DistAdj > rtnDist ) {
			rtn = line2Midpoint;
		}

		return Vector.normalise(rtn);
	}

	//_getForward(vertices, centre) {
	//	let rtn = null;
	//	let rtnDist = null;
	//	let rtnSymetry = null;
	//	for(let vert of vertices) {
	//		if ( !(vert.x == 0 && vert.y == 0) ) { 
	//			let curForward = Vector.sub(vert, centre);
	//			let totals = [0, 0];
	//			let dist = Vector.magnitude(curForward);
	//			for(let compareVert of vertices) {
	//				if ( compareVert != vert ) {
	//					let toVert = Vector.sub(compareVert, centre);
	//					let side = Vector.cross(curForward, toVert);
	//					if ( side >= 0 ) {
	//						totals[0]++;
	//					}
	//					else {
	//						totals[1]++;
	//					}
	//				}
	//			}
	//			let symetry = Math.abs(totals[0] - totals[1]);
	//			if ( rtn == null || symetry < rtnSymetry || (symetry == rtnSymetry && dist > rtnDist) ) {
	//				rtn = curForward;
	//				rtnDist = dist;
	//				rtnSymetry = symetry;
	//			}
	//		}
	//	}
	//	return Vector.normalise(rtn);
	//}

	_getHullEdges(vertices, hull) {
		let rtn = [];

		let hullIndicies = new Array(hull.length).fill(null);
		//Lookup the hull indices from vertices and sort to the order they appear in hull
		for(let i = 0; i < vertices.length; i++) {
			let v = vertices[i];
			let hullIndex = hull.findIndex(h => h.x==v.x && h.y==v.y);
			if ( hullIndex != -1  ) {
				hullIndicies[hullIndex] = i;
			}
		}

		//Wrap connect the convex hull
		for(let i = 1; i < hullIndicies.length; i++) {
			let fromIndex = hullIndicies[i-1];
			let toIndex = hullIndicies[i];
			rtn.push(new Edge(fromIndex, toIndex));
		}
		//Wrap around
		rtn.push(new Edge(hullIndicies[hullIndicies.length-1], hullIndicies[0]));

		return rtn;
	}

	_getEdges(vertices) {
		let rtn = [];

		//Randomly join.
		let numNodes = vertices.length;
		let joins = this._random.nextIntRange(0, numNodes*(numNodes-1)/2);
		for(let i = 0; i < joins; i++) {
			let fromIndex = this._random.nextIntRange(0, vertices.length-1);
			let selectList = vertices.map( (e, i) =>  i ).filter( e => e != fromIndex );
			let selectIndex = this._random.nextIntRange(0, selectList.length-1); 
			let toIndex = selectList[selectIndex];
			rtn.push(new Edge(fromIndex, toIndex));
		}

		return rtn;
	}

	_generateMesh(shipSettings, debug) {
		let settings = shipSettings.get();
		let circles = this._getCircles(settings);

		let vertices = this._getVertices(circles);
		let preTransformVertices = vertices.map(e => Vector.create(e.x, e.y));
		//let vertices = [Vector.create(0, 0), Vector.create(0, 1), Vector.create(-0.8, -0.8), Vector.create(0.8, -0.8)]
		let hull = Vertices.hull(preTransformVertices);
		let hullEdges = this._getHullEdges(vertices, hull);
		let edges = this._getEdges(vertices);
		let centre = Vertices.centre(hull);
		let forward = this._getForward(vertices, hullEdges, centre);
		//let forward = this._getForward(vertices, centre);
		Vertices.translate(vertices, Vector.neg(centre), 1);
		let angle = Vector.angle(Vector.create(0, 0), Vector.create(0, 1)) - Vector.angle(Vector.create(0, 0), forward);
		Vertices.rotate(vertices, angle, Vector.create(0, 0));

		let geometry = new BufferGeometry();
		let geometryVerts = new Float32Array(vertices.length*3);
		let allEdges = edges.concat(hullEdges);
		let geometryIndices = new Array(allEdges.length*2).fill(null);
		vertices.forEach( (e, i) => {
			let index = i*3;
			geometryVerts[index] = e.x;
			geometryVerts[index+1] = e.y;
			geometryVerts[index+2] = 0;
		});
		allEdges.forEach( (e, i) => {
			let index = i*2;
			geometryIndices[index] = e.startIndex;
			geometryIndices[index+1] = e.endIndex;
		});
		geometry.addAttribute('position', new BufferAttribute(geometryVerts, 3));
		geometry.setIndex(geometryIndices);

		let material = new LineBasicMaterial({
			color: 0xffffff,
			linewidth: 1,
		});
		this._transform = new LineSegments( geometry, material );

		if ( debug != undefined ) {
			debug.circles = circles;
			debug.preTransformVertices = preTransformVertices;
			debug.hull = hull;
			debug.hullEdges = hullEdges;
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
			this._inited = true;
		}
		else {
			throw new Error('Already Inited');
		}
	}

	destroy() {
		Renderer.remove(this._transform);
	}

	get inited() {
		return this._inited;
	}

}
Ship.prototype.destroy = Decorate(Ship.prototype.destroy, IsInited);
