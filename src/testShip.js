import { test, module } from 'qunit';
import { ShipSettings, Ship } from 'ship';

module('Test Ship.js');

test('ShipSettings', (assert) => {
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

test('Ship', (assert) => {
	let ship = new Ship();
});
