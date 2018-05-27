import { Renderer } from 'render.js';
import { Decorate } from 'util.js';
import { LineLoop, BufferGeometry, BufferAttribute, LineBasicMaterial, PointsMaterial, Points, LineSegments, BoxBufferGeometry, MeshBasicMaterial, Mesh } from 'three';
import { Vector } from 'matter-js';

let pointSize = 0.04;
pointSize = 1/pointSize;

const StateFalseCheck = function(func, args) {
	if ( !this._loaded ) {
		func.apply(this, args);
	}
	else {
		throw new Error('Already loaded');
	}
}

const StateTrueCheck = function(func, args) {
	if ( this._loaded ) {
		func.apply(this, args);
	}
	else {
		throw new Error('Already unloaded');
	}
}


export class CirclesLoader {
	constructor() {
		this._loaded = false;
		this._transforms = null;
		this._color = 0xffffff;
		this._segments = 30;
		this._depth = 20;
	}

	load(debug) {
		let circles = debug.circles;
		this._transforms = [];

		for(let circle of circles) {
			let vertices = new Float32Array(this._segments*3);
			let geometry = new BufferGeometry();
			for(let i = 0; i < this._segments; i++) {
				let vIndex = i*3;
				let theta = (i/this._segments)*Math.PI*2;
				vertices[vIndex] = circle.centreDistance*Math.sin(theta);
				vertices[vIndex+1] = circle.centreDistance*Math.cos(theta);
				vertices[vIndex+2] = -this._depth;
			}
			geometry.addAttribute('position', new BufferAttribute(vertices, 3));
			let mesh = new LineLoop(geometry, new LineBasicMaterial({color: this._color}));
			this._transforms.push(Renderer.add(mesh));
		}

		this._loaded = true;
	}

	unload() {
		this._transforms.forEach( e => Renderer.remove(e));
		this._transforms = null;

		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
CirclesLoader.prototype.load = Decorate(CirclesLoader.prototype.load, StateFalseCheck);
CirclesLoader.prototype.unload = Decorate(CirclesLoader.prototype.unload, StateTrueCheck);


export class VerticesLoader {
	constructor() {
		this._loaded = false;
		this._color = 0xff0000;
		this._transform = null;
		this._depth = 19;
		this._size = this._depth/pointSize;
	}

	load(debug) {
		let vertices = debug.preTransformVertices;
		let geometry = new BufferGeometry();
		let geometryVertices = new Float32Array(vertices.length*3);

		for(let i = 0; i < vertices.length; i++) {
			let vIndex = i*3;
			geometryVertices[vIndex] = vertices[i].x;
			geometryVertices[vIndex+1] = vertices[i].y;
			geometryVertices[vIndex+2] = -this._depth;
		}
		geometry.addAttribute('position', new BufferAttribute(geometryVertices, 3));
		let mesh = new Points(geometry, new PointsMaterial({color: this._color, size: this._size}));
		this._transform = Renderer.add(mesh);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;
		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
VerticesLoader.prototype.load = Decorate(VerticesLoader.prototype.load, StateFalseCheck);
VerticesLoader.prototype.unload = Decorate(VerticesLoader.prototype.unload, StateTrueCheck);

export class HullLoader {
	constructor() {
		this._loaded = false;
		this._color = 0x00ff00;
		this._transform = null;
		this._depth = 18;
		this._size = this._depth/pointSize;
	}

	load(debug) {
		let hull = debug.hull;
		let geometry = new BufferGeometry();
		let vertices = new Float32Array(hull.length*3);

		for(let i = 0; i < hull.length; i++) {
			let vIndex = i*3;
			vertices[vIndex] = hull[i].x;
			vertices[vIndex+1] = hull[i].y;
			vertices[vIndex+2] = -this._depth;
		}
		geometry.addAttribute('position', new BufferAttribute(vertices, 3));
		let mesh = new Points(geometry, new PointsMaterial({color: this._color, size: this._size}));
		this._transform = Renderer.add(mesh);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;
		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
HullLoader.prototype.load = Decorate(HullLoader.prototype.load, StateFalseCheck);
HullLoader.prototype.unload = Decorate(HullLoader.prototype.unload, StateTrueCheck);

export class HullEdgesLoader {
	constructor() {
		this._loaded = false;
		this._transform = null;
		this._color = 0x00ff00;
		this._depth = 17;
	}

	load(debug) {
		let vertices = debug.preTransformVertices;
		let hullEdges = debug.hullEdges;
		let geometryVertices = new Float32Array(hullEdges.length*2*3);
		let geometry = new BufferGeometry();

		for(let i = 0; i < hullEdges.length; i++) {
			let vIndex = i*2*3;
			let edge = hullEdges[i];
			let p1 = vertices[edge.startIndex];
			let p2 = vertices[edge.endIndex];
			geometryVertices[vIndex] = p1.x;
			geometryVertices[vIndex+1] = p1.y;
			geometryVertices[vIndex+2] = -this._depth;
			geometryVertices[vIndex+3] = p2.x;
			geometryVertices[vIndex+4] = p2.y;
			geometryVertices[vIndex+5] = -this._depth;
		}
		geometry.addAttribute('position', new BufferAttribute(geometryVertices, 3));
		let mesh = new LineSegments(geometry, new LineBasicMaterial({color: this._color}));
		this._transform = Renderer.add(mesh);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;

		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
HullEdgesLoader.prototype.load = Decorate(HullEdgesLoader.prototype.load, StateFalseCheck);
HullEdgesLoader.prototype.unload = Decorate(HullEdgesLoader.prototype.unload, StateTrueCheck);

export class EdgesLoader {
	constructor() {
		this._loaded = false;
		this._transform = null;
		this._color = 0xff0000;
		this._depth = 16;
	}

	load(debug) {
		let vertices = debug.preTransformVertices;
		let edges = debug.edges;
		let geometryVertices = new Float32Array(edges.length*2*3);
		let geometry = new BufferGeometry();

		for(let i = 0; i < edges.length; i++) {
			let vIndex = i*2*3;
			let edge = edges[i];
			let p1 = vertices[edge.startIndex];
			let p2 = vertices[edge.endIndex];
			geometryVertices[vIndex] = p1.x;
			geometryVertices[vIndex+1] = p1.y;
			geometryVertices[vIndex+2] = -this._depth;
			geometryVertices[vIndex+3] = p2.x;
			geometryVertices[vIndex+4] = p2.y;
			geometryVertices[vIndex+5] = -this._depth;
		}
		geometry.addAttribute('position', new BufferAttribute(geometryVertices, 3));
		let mesh = new LineSegments(geometry, new LineBasicMaterial({color: this._color}));
		this._transform = Renderer.add(mesh);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;

		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
EdgesLoader.prototype.load = Decorate(EdgesLoader.prototype.load, StateFalseCheck);
EdgesLoader.prototype.unload = Decorate(EdgesLoader.prototype.unload, StateTrueCheck);

export class CentreLoader {
	constructor() {
		this._loaded = false;
		this._transform = null;
		this._color = 0x0000ff;
		this._depth = 15;
		this._size = this._depth/pointSize/4;
	}

	load(debug) {
		let centre = debug.centre;
		let geometry = new BoxBufferGeometry(this._size, this._size, 0);
		let mesh = new Mesh(geometry, new MeshBasicMaterial({color: this._color}));
		this._transform = Renderer.add(mesh);
		this._transform.position.set(centre.x, centre.y, -this._depth);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;

		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
CentreLoader.prototype.load = Decorate(CentreLoader.prototype.load, StateFalseCheck);
CentreLoader.prototype.unload = Decorate(CentreLoader.prototype.unload, StateTrueCheck);

export class ForwardLoader {
	constructor() {
		this._loaded = false;
		this._transform = null;
		this._color = 0x0000ff;
		this._depth = 14;
	}

	load(debug) {
		let centre = debug.centre;
		let forward = debug.forward;
		let forwardP = Vector.add(centre, forward);
		forwardP = Vector.mult(forwardP, 10);
		let vertices = new Float32Array(6);
		vertices[0] = centre.x;
		vertices[1] = centre.y;
		vertices[2] = -this._depth;
		vertices[3] = forwardP.x;
		vertices[4] = forwardP.y;
		vertices[5] = -this._depth;
		let geometry = new BufferGeometry();
		geometry.addAttribute('position', new BufferAttribute(vertices, 3));
		let mesh = new LineSegments(geometry, new LineBasicMaterial({color: this._color}));
		this._transform = Renderer.add(mesh);

		this._loaded = true;
	}

	unload() {
		Renderer.remove(this._transform);
		this._transform = null;

		this._loaded = false;
	}

	get loaded() {
		return this._loaded;
	}
}
ForwardLoader.prototype.load = Decorate(ForwardLoader.prototype.load, StateFalseCheck);
ForwardLoader.prototype.unload = Decorate(ForwardLoader.prototype.unload, StateTrueCheck);
