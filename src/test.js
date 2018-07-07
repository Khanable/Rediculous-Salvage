import 'mocha/mocha.js';
import 'mocha/mocha.css';
import 'chai/register-assert';
import 'testEnvironmentSetup.js'

import 'util/binary.test.js';
import 'util/random.test.js';

let entryDiv = document.createElement('div');
entryDiv.setAttribute('id', 'mocha');
document.body.appendChild(entryDiv);

function main() {
	mocha.checkLeaks();
	mocha.run();
}
window.addEventListener('load', main);
