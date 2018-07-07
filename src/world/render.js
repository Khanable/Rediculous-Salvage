import { WebGLRenderer, Scene, OrthographicCamera, Object3D } from 'three';
import { Vector2 } from 'util/vector.js';
import 'util/array.js';

export class CameraProjection {
	constructor(left, right, top, bottom, aspect) {
		this._left = left;
		this._right = right;
		this._top = top;
		this._bottom = bottom;
		this._aspect = aspect;
	}
	get left() {
		return this._left;
	}
	get right() {
		return this._right;
	}
	get top() {
		return this._top;
	}
	get bottom() {
		return this._bottom;
	}
	get aspect() {
		return this._aspect;
	}
}

export class CameraPos {
	constructor(pos, zoom) {
		this._pos = pos;
		this._zoom = zoom;
	}

	get pos() {
		return this._pos;
	}
	get zoom() {
		return this._zoom;
	}
}

export class Renderer {
	constructor() {
		this._renderer = null;
		this._scene = null;
		this._camera = null;
		this._containerSize = null;
		this._entities = [];

		this._renderer = new WebGLRenderer();
		this._scene = new Scene();
		this._camera = new OrthographicCamera();
		this._scene.add(this._camera);
	}

	get domElement() {
		return this._renderer.domElement;
	}
	get cameraProjection() {
		return new CameraProjection(this._camera.left, this._camera.right, this._camera.top, this._camera.bottom, this._camera.aspect);
	}
	get size() {
		return Vector2.from(this._renderer.size);
	}

	resize(containerSize) {
		this._containerSize = containerSize;
		let aspect = containerSize.x/containerSize.y;
		aspect*=this._camera.position.z;
		this._camera.left = -aspect;
		this._camera.right = aspect;
		this._camera.top = this._camera.position.z;
		this._camera.bottom = -this._camera.position.z;
		this._camera.updateProjectionMatrix();
		this._renderer.setSize(containerSize.x, containerSize.y);
	}

	render() {
		this._renderer.render(this._scene, this._camera);
	}

	set cameraPos(cameraPos) {
		this._camera.position.copy( cameraPos.pos.toThree(cameraPos.zoom) );
		this.resize(this._containerSize);
	}
	get cameraPos() {
		return new CameraPos(Vector.from(this._camera.position), this._camera.position.z);
	}

	get entities() {
	}
	get entitiesFlat() {
	}

	add(entity) {
		this._entities.push(entity);
		this._scene.add(sceneEntity.object3D);
		return obj;
	}

	remove(entity) {
		this._entities.remove(entity);
		this._scene.remove(sceneEntity.object3D);
	}
}
