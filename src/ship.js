import { Engine, World, Bodies, Vertices, Vector } from 'matter-js';
import { Object3D, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, AxesHelper } from 'three';
import { Renderer } from 'render.js';
import { Decorate, IsInited } from 'util.js';
import { AngleBetween, AngleBetweenSigned } from 'vector.js';

export class ShipSettings {
	constructor() {
		this._minCircles = 2;
		this._maxCircles = 5;
		this._minCircleDistance = 0.05;
		this._maxCircleDistance = 3;
		this._minExtraNodes = 5;
		this._maxExtraNodes = 15;
		this._minExtraThrusters = 0;
		this._maxExtraThrusters = 5;
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

class RingLevel {
	constructor(distance, indicies) {
		this._distance = distance;
		this._indicies = indicies;
	}

	get distance() {
		return this._distance;
	}
	get indicies() {
		return Array.from(this._indicies);
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

class SymetryMeta {
	constructor(index, vertexList) {
		this._list = vertexList;
		this._index = index;
		this._symetry = this._getSymetryDiff(this._index, this._list);
	}

	_getSymetryDiff(i, vertices) {
		let rtn = [0, 0];
		let v = vertices[i];
		vertices.forEach( (testV, j) => {
			if ( i != j ) {
				let side = Vector.cross(v, testV);
				if ( side >= 0 ) {
					rtn[0]++;
				}
				else {
					rtn[1]++;
				}
			}
		});
		return Math.abs(rtn[0] - rtn[1]);
	}

	get symetry() {
		return this._symetry;
	}
	get vertex() {
		return this._list[this._index];
	}
}

class Thruster {
	constructor(position, dir, weight) {
		this._position = position;
		this._dir = dir;
		this._weight = weight;
	}

	get position() {
		this._position;
	}
	get dir() {
		return this._dir;
	}
	get weight() {
		return this._weight;
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
			circle.numNodes = 1;
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
		let rtn = {};
		let verticesRingLevel = new Map();
		rtn.vertices = [Vector.create(0, 0)];
		verticesRingLevel.set(0, [0]);
		
		//Generate Vertices with data about their ring level
		for(let circle of circles) {
			let thetas = [];
			for(let i = 0; i < circle.numNodes; i++) {
				let theta = this._random.nextFloatRange(0, Math.PI*2);
				if ( !thetas.includes(theta) ) {
					thetas.push(theta);
					let x = circle.centreDistance*Math.sin(theta);
					let y = circle.centreDistance*Math.cos(theta);
					rtn.vertices.push(Vector.create(x, y));
					let index = rtn.vertices.length-1;

					let indiciesGroup = null;
					if ( verticesRingLevel.has(circle.centreDistance) ) {
						indiciesGroup = verticesRingLevel.get(circle.centreDistance);
					}
					else {
						indiciesGroup = [];
						verticesRingLevel.set(circle.centreDistance, indiciesGroup);
					}
					indiciesGroup.push(index);
				}
			}
			circle.numNodes = thetas.length;
		}
		//Order and reduce ring level map
		rtn.ringLevels = Array.from(verticesRingLevel).map( e => new RingLevel(e[0], e[1]) ).sort( (a,b) => a.distance - b.distance );

		return Object.freeze(rtn);
	}

	//_getForward(vertices, hullEdges, centre) {
	//	let rtn = null;
	//	let rtnDist = null;
	//	let hullEdgeIndex = null;

	//	//Find furthest vert from centre
	//	for(let i = 0; i < hullEdges.length; i++) {
	//		let edge = hullEdges[i];
	//		let p1 = vertices[edge.startIndex];
	//		let linePoint = Vector.sub(p1, centre);
	//		let distPoint = Vector.magnitude(linePoint);

	//		if ( rtn == null || distPoint > rtnDist ) {
	//			rtn = linePoint;
	//			rtnDist = distPoint;
	//			hullEdgeIndex = i;
	//		}
	//	}

	//	//Consider edge midpoints on ether side of furthest vert from centre
	//	let edge1 = hullEdges[hullEdgeIndex];
	//	let pR = vertices[edge1.startIndex];
	//	let p1 = vertices[edge1.endIndex];
	//	let p2 = hullEdges.find( e => e.endIndex == edge1.startIndex ).startIndex;
	//	p2 = vertices[p2];

	//	let line1 = Vector.sub(p1, pR);
	//	let line2 = Vector.sub(p2, pR);
	//	let edge1Midpoint = Vector.add(pR, Vector.div(line1, 2));
	//	let edge2Midpoint = Vector.add(pR, Vector.div(line2, 2));

	//	let line1Mag = Vector.magnitude(line1);
	//	let line2Mag = Vector.magnitude(line2);
	//	let line1Midpoint = Vector.sub(edge1Midpoint, centre);
	//	let line2Midpoint = Vector.sub(edge2Midpoint, centre);
	//	let line1MidpointMag = Vector.magnitude(line1Midpoint);
	//	let line2MidpointMag = Vector.magnitude(line2Midpoint);

	//	//let midPoint1DistAdj = line1MidpointMag+line1MidpointMag/line1Mag;
	//	let midPoint1DistAdj = line1MidpointMag;
	//	let midPoint2DistAdj = line2MidpointMag;

	//	if ( midPoint1DistAdj > rtnDist ) {
	//		rtn = line1Midpoint;
	//	}
	//	else if ( midPoint2DistAdj > rtnDist ) {
	//		rtn = line2Midpoint;
	//	}

	//	return Vector.normalise(rtn);
	//}


	_getForward(vertices, hullIndicies, hullEdges, centre) {
		let rtn = null;

		//Adjust all vertices by the centre point.
		vertices = vertices.map( e => Vector.create(e.x, e.y));
		Vertices.translate(vertices, Vector.neg(centre), 1);

		let midPoints = [];
		hullEdges.forEach( (e) => {
			let p1 = vertices[e.startIndex];
			let p2 = vertices[e.endIndex];
			let relV = Vector.sub(p2, p1);
			relV = Vector.div(relV, 2);
			let midP = Vector.add(p1, relV);
			midPoints.push(midP);
		});

		let hullSymetry = hullIndicies.map( hI => new SymetryMeta(hI, vertices) ); 
		let midpointSymetry = midPoints.map( (e, i) => new SymetryMeta(i, midPoints) );
		let symetry = hullSymetry.concat(midpointSymetry);

		//Filter to best symetry choices and select random
		let bestSymetry = symetry.map( e => e.symetry ).reduce( (acc, cv) => cv < acc ? cv : acc );
		symetry = symetry.filter( e => e.symetry == bestSymetry );
		let randSymetryIndex = this._random.nextIntRange(0, symetry.length-1);
		rtn = symetry[randSymetryIndex];

		return Vector.normalise(rtn.vertex);
	}

	_getHullEdges(vertices, hullIndicies) {
		let rtn = [];

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

	_getEdges(vertices, ringLevels, hullIndicies, internalIndicies) {
		//Determine all possible internal edges
		//Restrict edges based on conditions.
		let availableEdges = [];
		for(let fromIndex = 0; fromIndex < vertices.length; fromIndex++) {
			let isFromHullIndex = hullIndicies.includes(fromIndex);
			let fromLevel = ringLevels.findIndex( e => e.indicies.includes(fromIndex) );
			for( let toIndex = fromIndex+1; toIndex < vertices.length; toIndex++ ) {
				let toLevel = ringLevels.findIndex( e => e.indicies.includes(toIndex) );
				let levelDiff = Math.abs(fromLevel-toLevel);
				let notFromHullToHull = !(isFromHullIndex && hullIndicies.includes(toIndex));
				let relVector = Vector.sub(vertices[toIndex], vertices[fromIndex]);
				let relDistance = Vector.magnitude(relVector);
				let distanceOk = relDistance <= ringLevels[fromLevel].distance || relDistance <= ringLevels[toLevel].distance;
				if ( notFromHullToHull && levelDiff <= 1 && distanceOk ) {
					availableEdges.push(new Edge(fromIndex, toIndex));
				}
			}
		}

		
		//Join internal edges with at least 1 connection to another edge
		let rtn = [];
		for(let i = 0; i < internalIndicies.length-1; i++) {
			let internalIndex = internalIndicies[i];
			let edges = availableEdges.filter( e => e.startIndex == internalIndex || e.endIndex == internalIndex );
			if ( edges.length > 0 ) {
				let edgeIndex = this._random.nextIntRange(0, edges.length-1);
				let edge = edges[edgeIndex];
				rtn.push(availableEdges.splice(availableEdges.indexOf(edge), 1)[0]);
			}
		}


		//Make some extra joins
		let joins = this._random.nextIntRange(0, availableEdges.length-1);
		for(let i = 0; i < joins; i++) {
			if ( availableEdges.length > 0 ) {
				let joinIndex = this._random.nextIntRange(0, availableEdges.length-1);
				rtn.push(availableEdges.splice(joinIndex, 1)[0]);
			}
			else {
				break;
			}
		}

		return rtn;
	}

	_getHullIndicies(vertices, hull) {
		let hullIndicies = new Array(hull.length).fill(null);
		//Lookup the hull indices from vertices and preserve the order they appear in hull
		for(let i = 0; i < vertices.length; i++) {
			let v = vertices[i];
			let hullIndex = hull.findIndex(h => h==v);
			if ( hullIndex != -1  ) {
				hullIndicies[hullIndex] = i;
			}
		}
		return hullIndicies;
	}

	_getThruster(settings, vertices, hullEdges, centre, targetWeight) {
		let rtn = null;
		let index = this._random.nextIntRange(0, hullEdges.length-1);
		let edge = hullEdges[index];
		let p1 = vertices[edge.startIndex];
		let p2 = vertices[edge.endIndex];
		let relV = Vector.sub(p2, p1);
		let unitRelVP1P2 = Vector.normalise(relV);
		let unitRelVP2P1 = Vector.normalise(Vector.sub(p1, p2));
		let randDist = this._random.nextFloatRange(0, 1);
		let position = Vector.add(p1, Vector.mult(relV, randDist));
		let unitCentreV = Vector.sub(position, centre);
		let leftAngle = AngleBetween(unitCentreV, unitRelVP2P1);
		let rightAngle = 180 - leftAngle;
		let angleRanges = [leftAngle, rightAngle];
		let dirPick = this._random.nextIntRange(0, 1);
		let angle = null;
		let weight = null;
		if ( targetWeight ) {
			angle = targetWeight*angleRanges[dirPick];
			weight = targetWeight;
		}
		else {
			angle = this._random.nextFloatRange(0, angleRanges[dirPick]);
			weight = rangeAngle/angleRanges[dirPick];
		}
		let dir = Vector.rotate(unitCentreV, dirPick ? -angle : angle);
		return Thruster(position, dir, weight);
	}

	_getThrusters(vertices, hullEdges, centre) {
		let rtn = [];

		rtn.push(this._getThruster(vertices, hullEdges, centre));
		rtn.push(this._getThruster(vertices, hullEdges, centre, 1-rtn[0].weight));

		let numExtra = this._random.nextIntRange(settings.minExtraThrusters, settings.maxExtraThrusters);
		for(let i = 0; i < numExtra; i++) {
			rtn.push(this._getThruster(vertices, hullEdges, centre));
		}

		//Control keys here too.

		return rtn;
	}

	_generateMesh(shipSettings) {
		let rtn = {};

		let settings = shipSettings.get();
		let circles = this._getCircles(settings);
		let getVerticesData = this._getVertices(circles);
		let vertices = getVerticesData.vertices;
		let ringLevels = getVerticesData.ringLevels;
		//let vertices = [Vector.create(0, 0), Vector.create(0, 1), Vector.create(-0.8, -0.8), Vector.create(0.8, -0.8)]
		let hull = Vertices.hull(vertices);
		let hullIndicies = this._getHullIndicies(vertices, hull);
		let internalIndicies = Array.from(vertices).map( (e,i) => i ).filter( i => !hullIndicies.includes(i) );
		let hullEdges = this._getHullEdges(vertices, hullIndicies);
		let internalEdges = this._getEdges(vertices, ringLevels, hullIndicies, internalIndicies);
		let centre = Vertices.centre(hull);
		//let forward = this._getForward(vertices, hullEdges, centre);
		let forward = this._getForward(vertices, hullIndicies, hullEdges, centre);
		let thrusters = this._getThrusters(vertices, hullEdges, centre);

		rtn.circles = circles;
		rtn.vertices = vertices;
		rtn.hullIndicies = hullIndicies;
		rtn.hullEdges = hullEdges;
		rtn.internalEdges = internalEdges;
		rtn.centre = centre;
		rtn.forward = forward;
		rtn.thrusters = thrusters;
		Object.freeze(rtn);
		return rtn;
	}

	_translateCentre(shipMeshData) {
		let rtnData = Object.create(shipMeshData);

		let vertices = rtnData.vertices.map(e => Vector.create(e.x, e.y));
		Vertices.translate(vertices, Vector.neg(rtnData.centre), 1);
		let centre = Vector.add(rtnData.centre, Vector.neg(rtnData.centre));

		Object.defineProperty(rtnData, 'vertices', { value: vertices });
		Object.defineProperty(rtnData, 'centre', { value: centre });
		return Object.freeze(rtnData);
	}

	_rotateForward(shipMeshData) {
		let rtnData = Object.create(shipMeshData);

		let angle = AngleBetweenSigned(Vector.create(0, 1), rtnData.forward);

		let vertices = rtnData.vertices.map(e => Vector.create(e.x, e.y));
		Vertices.rotate(vertices, angle, Vector.create(0, 0));
		let centre = Vector.rotate(rtnData.centre, angle, Vector.create(0, 0));
		let forward = Vector.rotate(rtnData.forward, angle, Vector.create(0, 0));

		Object.defineProperty(rtnData, 'vertices', { value: vertices });
		Object.defineProperty(rtnData, 'centre', { value: centre });
		Object.defineProperty(rtnData, 'forward', { value: forward });
		return Object.freeze(rtnData);
	}

	init(shipSettings) {
		if ( !this._inited ) { 
			let meshData = this._generateMesh(shipSettings);
			meshData = this._translateCentre(meshData);
			meshData = this._rotateForward(meshData);

			let geometry = new BufferGeometry();
			let geometryVerts = new Float32Array(meshData.vertices.length*3);
			let allEdges = meshData.edges.concat(meshData.hullEdges);
			let geometryIndices = new Array(allEdges.length*2).fill(null);
			meshData.vertices.forEach( (e, i) => {
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
