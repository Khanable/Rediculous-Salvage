import { Renderer } from 'render.js';
import { Decorate } from 'util.js';
import { LineLoop, BufferGeometry, BufferAttribute, LineBasicMaterial, PointsMaterial, Points, LineSegments } from 'three';

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
		this._color = 0xffff00;
		this._segments = 30;
		this._depth = 0;
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
				vertices[vIndex+2] = this._depth;
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
		this._size = 0.08;
		this._color = 0xff0000;
		this._transform = null;
		this._depth = 1;
	}

	load(debug) {
		let vertices = debug.vertices;
		let geometry = new BufferGeometry();
		let geometryVertices = new Float32Array(vertices.length*3);

		for(let i = 0; i < vertices.length; i++) {
			let vIndex = i*3;
			geometryVertices[vIndex] = vertices[i].x;
			geometryVertices[vIndex+1] = vertices[i].y;
			geometryVertices[vIndex+2] = this._depth;
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
		this._size = 0.09;
		this._color = 0xff00ff;
		this._transform = null;
		this._depth = 2;
	}

	load(debug) {
		let hull = debug.hull;
		let geometry = new BufferGeometry();
		let vertices = new Float32Array(hull.length*3);

		for(let i = 0; i < hull.length; i++) {
			let vIndex = i*3;
			vertices[vIndex] = hull[i].x;
			vertices[vIndex+1] = hull[i].y;
			vertices[vIndex+2] = this._depth;
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
		this._depth = 3;
	}

	load(debug) {
		let vertices = debug.vertices;
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
			geometryVertices[vIndex+2] = this._depth;
			geometryVertices[vIndex+3] = p2.x;
			geometryVertices[vIndex+4] = p2.y;
			geometryVertices[vIndex+5] = this._depth;
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
		this._depth = 4;
	}

	load(debug) {
		let vertices = debug.vertices;
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
			geometryVertices[vIndex+2] = this._depth;
			geometryVertices[vIndex+3] = p2.x;
			geometryVertices[vIndex+4] = p2.y;
			geometryVertices[vIndex+5] = this._depth;
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
		this._color = 0x00ffff;
		this._depth = 5;
		this._size = 0.1;
	}

	load(debug) {
		let centre = debug.centre;
		let vertices = new Float32Array(3);
		let geometry = new BufferGeometry();

		vertices[0] = centre.x;
		vertices[1] = centre.y;
		vertices[2] = this._depth;
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
EdgesLoader.prototype.load = Decorate(EdgesLoader.prototype.load, StateFalseCheck);
EdgesLoader.prototype.unload = Decorate(EdgesLoader.prototype.unload, StateTrueCheck);
