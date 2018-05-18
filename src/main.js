import { Ship, ShipSettings } from 'ship.js';
import { RandomFactory } from 'random.js';
import { Update } from 'update.js';
import { Renderer } from 'render.js';
import { Vector2 } from 'three';


const main = function() {
	Update.init();
	Renderer.init();


	let randomFactory = new RandomFactory(1);
	let settings = new ShipSettings();
	let ship = new Ship(randomFactory);
	ship.init(settings);

	Renderer.setCameraPos(new Vector2(0, 0));
	Update.start();
}
window.addEventListener('load', main);
