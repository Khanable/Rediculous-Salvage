import { Subject, ReplaySubject } from 'rxjs';
import { Decorate, DecorateDescriptor, IsInited } from 'util.js';

export class _Update {

	constructor() {
		this._update = null;
		this._render = null;

		this._inited = false;
	}

	init() {
		if ( !this._inited ) {
			this._update = new Subject();
			this._render = new Subject();

			document.addEventListener('visibilitychange', () => {
				if ( document.visibilityState == 'hidden' && this._running ) {
					this._wasRunning = true;
					this.stop();
				}
				else if ( document.visibilityState == 'visible' && this._wasRunning ) {
					this.start();
				}
			});

			this._inited = true;
		}
		else {
			throw new Error('Already inited');
		}
	}

	_reset() {
		this._running = false;
		this._wasRunning = false;
		this._lastT = null;
		this._callbackID = null;
	}

	get render() {
		return this._render;
	}
	get update() {
		return this._update;
	}

	_loop(time) {
		time/=1000;
		let dt = 0;
		//Handle stop then start without jump in dt
		if ( this._lastT == null ) {
			dt = 0;
		}
		else {
			dt = time-this._lastT;
		}
		this._lastT = time;

		this._update.next(dt);
		this._render.next(dt);

		this._callbackID = window.requestAnimationFrame(this._loop.bind(this));
	}


	start() {
		if ( !this._running ) {
			this._reset();
			this._running = true;
			this._callbackID = window.requestAnimationFrame(this._loop.bind(this));
		}
		else {
			throw new Error('Already running');
		}
	}

	stop() {
		if ( this._running ) {
			this._running = false;
			window.cancelAnimationFrame(this._callbackID);
		}
		else {
			throw new Error('Not running');
		}
	}
}
DecorateDescriptor(_Update.prototype, 'render', IsInited, 'get');
DecorateDescriptor(_Update.prototype, 'update', IsInited, 'get');
_Update.prototype.start = Decorate(_Update.prototype.start, IsInited);
_Update.prototype.stop = Decorate(_Update.prototype.stop, IsInited);

export const Update = new _Update();
