import { Subject, ReplaySubject } from 'rxjs';

export class LoopController {

	constructor() {
		this._updateLoop = null;
		this._renderLoop = null;

		this._updateLoop = new Subject();
		this._renderLoop = new Subject();

		document.addEventListener('visibilitychange', () => {
			if ( document.visibilityState == 'hidden' && this._running ) {
				this._wasRunning = true;
				this.stop();
			}
			else if ( document.visibilityState == 'visible' && this._wasRunning ) {
				this.start();
			}
		});
	}

	_reset() {
		this._running = false;
		this._wasRunning = false;
		this._lastT = null;
		this._callbackID = null;
	}

	get renderLoop() {
		return this._renderLoop;
	}
	get updateLoop() {
		return this._updateLoop;
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

		this._updateLoop.next(dt);
		this._renderLoop.next(dt);

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
