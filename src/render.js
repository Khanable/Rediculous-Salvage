import { Update } from 'update.js';
import { WebGLRenderer, Scene, PerspectiveCamera, Vector3, OrthographicCamera } from 'three';
import { Decorate, IsInited } from 'util.js';

class _Renderer {
	constructor() {
		this._update = Update;
		this._inited = false;

		this._renderer = null;
		this._scene = null;
		this._camera = null;
	}

	init() {
		if ( !this._inited ) {
			document.body.setAttribute('style', 'margin:0px;');
			this._renderer = new WebGLRenderer();
			this._scene = new Scene();
			this._camera = new OrthographicCamera();
			this._scene.add(this._camera);
			this._renderer.domElement.setAttribute('style', 'display:block;');
			document.body.appendChild(this._renderer.domElement);

			window.addEventListener('resize', this._resize.bind(this));
			this._update.update.subscribe(this._render.bind(this));

			this._resize();

			this._inited = true;
		}
		else {
			throw new Error('Already inited');
		}
	}

	get inited() {
		return this._inited;
	}

	_resize() {
		let windowSize = [window.innerWidth, window.innerHeight];
		let aspect = windowSize[0]/windowSize[1];
		aspect*=this._camera.position.z;
		this._camera.left = -aspect;
		this._camera.right = aspect;
		this._camera.top = this._camera.position.z;
		this._camera.bottom = -this._camera.position.z;
		this._camera.updateProjectionMatrix();
		this._renderer.setSize(windowSize[0], windowSize[1]);
	}

	_render(dt) {
		this._renderer.render(this._scene, this._camera);
	}

	setCameraPos(pos) {
		this._camera.position.copy( new Vector3(pos.x, pos.y, pos.z) );
		this._resize();
	}

	add(obj) {
		this._scene.add(obj);
		return obj;
	}
	remove(obj) {
		this._scene.remove(obj);
	}
}
_Renderer.prototype.add = Decorate(_Renderer.prototype.add, IsInited);
_Renderer.prototype.remove = Decorate(_Renderer.prototype.remove, IsInited);


export const Renderer = new _Renderer();
