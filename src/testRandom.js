import { test, module } from 'qunit';
import { RandomFactory } from 'random.js';

module('testRandom.js');

test('RandomFactory constructor', (assert) => {
	assert.ok(new RandomFactory());
	assert.ok(new RandomFactory(1));
});

const TestInRange = function(assert, sR, eR, nextMethod) {
	let res = nextMethod(sR, eR);
	assert.ok( res >= sR && res <= eR );
}
const TestDomain = function(assert, sR, eR, nextMethod) {
	let randRange = new Array(eR).fill(null).map( rand.nextMethod(sR, eR) );
	let domain = []; 
	randRange.forEach( e => {
		if ( !domain.includes(e) ) {
			domain.push(e);
		}
	});
	assert.ok( domain.length > 1 && domain.length <= eR, 'check getting an expected domain of random numbers');
}
const TestType = function(assert, nextMethod, test) {
	let res = nextMethod(0, 1);
	assert.equal(res, test(res));
}

const GenericNextTest = function(assert, nextFunc, typeTest) {
	let rand = new RandomFactory(1);
	let nextMethod = nextFunc.bind(rand);
	
	TestType(assert, nextMethod, typeTest );
	TestInRange(assert, 0, 10, nextMethod);
	TestInRange(assert, -10, -1, nextMethod);
	TestDomain(assert, 0, 10, nextMethod);
	assert.equal(nextMethod(0, 0), 0);
	assert.throws(nextMethod(0, -1));
}

test('RandomFactory.nextIntRange', (assert) => {
	GenericNextTest(assert, RandomFactory.prototype.nextIntRange, (res) => parseInt(res) == res );
});

test('RandomFactory.nextFloatRange', (assert) => {
	GenericNextTest(assert, RandomFactory.prototype.nextFloatRange, (res) => res.toString().split('.').length == 2 );
});

test('RandomFactory seeds give different results', (assert) => {
	let rand1 = new RandomFactory(0);
	let rand2 = new RandomFactory(1);
	let sRange = 0;
	let eRange = 10;
	assert.notequal(rand1.nextIntRange(sRange, eRange), rand2.nextIntRange(sRange, eRange));
	assert.notequal(rand1.nextFloatRange(sRange, eRange), rand2.nextFloatRange(sRange, eRange));
});
