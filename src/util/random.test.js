import { RandomFactory } from 'util/random.js';

describe('util/random.js', () => {

	describe('RandomFactory', () => {

		it('constructor', () => {
			let factory = new RandomFactory();
			assert.equal(factory.inspec_seed, 0);
			factory = new RandomFactory(1);
			assert.equal(factory.inspec_seed, 1);
		});

		const TestDomain = function(sR, eR, numGen, nextMethod) {
			let randRange = new Array(numGen).fill(null).map( (e) => nextMethod(sR, eR) );
			randRange.forEach( e => {
				assert.ok( e > sR && e <= eR );
			});
		}
		const TestType = function(nextMethod, it) {
			let res = nextMethod(0, 1);
			assert.ok(it(res), 'Returned type');
		}

		const GenericNextTest = function(nextFunc, typeTest) {
			let rand = new RandomFactory(1);
			let nextMethod = nextFunc.bind(rand);
			let sRange = 0;
			let eRange = 1;
			let numGen = 10;
			
			TestType(nextMethod, typeTest );
			TestDomain(sRange, eRange, numGen, nextMethod);
			TestDomain(-eRange, sRange, numGen, nextMethod);
			assert.equal(nextMethod(sRange, sRange), sRange);
			assert.throws(() => nextMethod(sRange, sRange-1), /greater than max/i);

			let rand1 = new RandomFactory(0);
			let rand2 = new RandomFactory(1);
			assert.notEqual(nextFunc.call(rand1, sRange, eRange), nextFunc.call(rand2, sRange, eRange));
		}

		it('nextIntRange', () => {
			GenericNextTest(RandomFactory.prototype.nextIntRange, (res) => parseInt(res) == res );
		});

		it('nextFloatRange', () => {
			GenericNextTest(RandomFactory.prototype.nextFloatRange, (res) => res.toString().split('.').length == 2 );
		});

	});


});
