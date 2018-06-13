import { start } from 'qunit';
import 'qunit/qunit/qunit.css';

import 'testBinary.js'
import 'testRandom.js'
import 'testRender.js'
import 'testShip.js';

let dom = `
	<div id='qunit'></div>
	<div id='qunit-fixture'></div>
`;
let parser = new DOMParser();
let tree = Array.from(parser.parseFromString(dom, 'text/html').body.children);
tree.forEach( e => document.body.appendChild(e) );



window.addEventListener('load', start);
