export class Entity {
	constructor() {
		this._object3D = new Object3D();
	}
	set pos(v) {
		this._object3D.position.copy(v.toThree(0));
	}
	get pos() {
		return Vector.from(this._object3D.position);
	}
	set scale(s) {
		this._object3D.scale = s;
	}
	get scale() {
		return this._object3D.scale;
	}
	set rot(s) {
		this._object3D.rotation = s;
	}
	get rot() {
		return this._object3D.rotation;
	}
	addChild(entity) {
		this._object3D.add(entity.object3D);
	}
	removeChild(entity) {
		this._object3D.remove(entity.object3D);
	}


	get object3D() {
		return this._object3D;
	}
}
