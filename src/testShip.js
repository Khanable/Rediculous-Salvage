import { test, module } from 'qunit';
import { ShipSettings, Ship } from 'ship';
import { RandomFactory } from 'random';

module('Test Ship.js');

test('ShipSettings set/get', (assert) => {
	let settings = new ShipSettings();
	let defaults = settings.get();
	let changeKey = Array.from(Object.keys(defaults)).pop();
	let changes = {};
	let target = defaults[changeKey]+1;
	changes[changeKey] = target;
	settings.set(changes);
	let changeResult = settings.get();
	assert.ok(changeResult[changeKey] == target, 'Setting changes work');
});

test('Ship._generateMesh', (assert) => {
	let settings = new ShipSettings();
	let randomFactory = new RandomFactory(0);
	let ship = new Ship(randomFactory);
	let debug = {};
	ship._generateMesh(settings, debug);

	console.log('--Ship.Create debug info');
	console.log('vertices');
	console.log(debug.vertices);
	console.log('edges');
	console.log(debug.edges);
	console.log('centre');
	console.log(debug.centre);
	console.log('forward');
	console.log(debug.forward);
	console.log('--');

	assert.ok(true, 'Ship create works');
});
