import { Ship, ShipSettings } from 'ship.js';
import { RandomFactory } from 'random.js';
import { Update } from 'update.js';
import { Renderer } from 'render.js';
import { Vector3 } from 'three';


const main = function() {
	Update.init();
	Renderer.init();


	let randomFactory = new RandomFactory(0);
	let settings = new ShipSettings();
	let ship = new Ship(randomFactory);
	ship.init(settings);

	Renderer.setCameraPos(new Vector3(0, 0, 5));
	Update.start();
}
window.addEventListener('load', main);
