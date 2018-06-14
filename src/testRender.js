import { test, module } from 'qunit';
import { Renderer } from 'render.js';
import { Subject } from 'rxjs';
import { Vector2 } from 'vector.js'

module('testRender.js');

test('Render constructor', (assert) => {
	assert.ok(new Renderer());
});

test('Renderer.domElement', (assert) => {
	assert.notEqual(new Renderer().domElement, null);
});

test('Render.resize', (assert) => {
	let renderer = new Renderer();
	let size = new Vector2(100, 100);
	renderer.resize(size);

	let dom = renderer.domElement;
	let lastProjection = renderer.cameraProjection;
	let domSize = new Vector(parseInt(dom.getAttribute('width')), parseInt(dom.getAttribute('height')));
	assert.deepEqual(size, domSize);
	assert.deepEqual(size, renderer.size);
	assert.notDeepEqual(lastProjection, renderer.cameraProjection);

	assert.throws(renderer.resize(size.neg()), Error);
});

test('Render.render', (assert) => {
	let renderer = new Renderer();

	assert.ok(renderer.render() == null);
});

test('Render.setCameraPos', (assert) => {
	let renderer = new Renderer();

	let lastProjection = renderer.cameraProjection;
	assert.deepEqual(renderer.cameraPos, new CameraPos(Vector2.zero, 0));
	let to = new CameraPos(new Vector2(3, 5), 10);

	renderer.cameraPos(to);
	assert.deepEqual(renderer.cameraPos, to);
	assert.notDeepEqual(renderer.cameraProjection, lastProjection);
});

test('Render.add', (assert) => {
	let renderer = new Renderer();
	renderer.resize();
		//check size of dom element canvas, width/height. also. and get size. and projection correct.
});

test('Render.remove', (assert) => {
	let renderer = new Renderer();
	renderer.resize();
		//check size of dom element canvas, width/height. also. and get size. and projection correct.
});
