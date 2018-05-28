import { Ship, ShipSettings } from 'ship.js';
import { RandomFactory } from 'random.js';
import { Update } from 'update.js';
import { Renderer } from 'render.js';
import { Vector3, AxesHelper } from 'three';
import { CirclesLoader, VerticesLoader, HullLoader, HullEdgesLoader, EdgesLoader, CentreLoader, ForwardLoader } from 'shipViewerLoaders.js';
import 'string.js';

let shipDebug = null;
const inputHandlers = [];
let curSeed = '0';
const stages = [
	'Circles',
	'Vertices',
	'Hull',
	'HullEdges',
	'Edges',
	'Centre',
	'Forward',
];
const stagesEnum = {}
const stageLoaders = [
	new CirclesLoader(),
	new VerticesLoader(),
	new HullLoader(),
	new HullEdgesLoader(),
	new EdgesLoader(),
	new CentreLoader(),
	new ForwardLoader(),
];


const loadStage = function(stage) {
	stageLoaders[stage].load(shipDebug);
}
const unloadStage = function(stage) {
	stageLoaders[stage].unload();
}


const generateShip = function(seed) {
	curSeed = seed.toString();
	const randomFactory = new RandomFactory(parseInt(seed));
	const ship = new Ship(randomFactory);
	let settings = new ShipSettings();
	shipDebug = {};
	ship._generateMesh(settings, shipDebug);

	stageLoaders.forEach( e => {
		if ( e.loaded ) {
			e.unload();
			e.load(shipDebug);
		}
	});
}

const handleSetSeed = (function() {
	let domText = null;
	let showSeedInput = false;
	let numberChars = new Array(10).fill(null).map( (e, i) => i.toString() );

	domText = document.createElement('div');
	domText.setAttribute('style', 'position:absolute;top:0px;left:0px;z-index:100;width:200px;background:white;height:20px;');
	domText.innerText = curSeed;

	return function(key) {
		let rtn = false;

		if ( key == 's' ) {
			if ( !showSeedInput ) {
				document.body.appendChild(domText);
			}
			else {
				document.body.removeChild(domText);
			}
			showSeedInput = showSeedInput ? false : true;
			rtn = true;
		}
		else if ( showSeedInput ) {
			let changed = false;
			let number = numberChars.includes(key);
			if ( number ) {
				curSeed+=key;
				changed = true;
			}
			else if ( key == 'Backspace' ) {
				curSeed = curSeed.slice(0, curSeed.length-1);
				changed = true;
			}

			if ( changed ) {
				domText.innerText = curSeed;
				generateShip(curSeed);
				rtn = true;
			}
		}

		return rtn;
	}
})();
inputHandlers.push(handleSetSeed);


const handleShipStage = (function() {
	let showStageToggle = false;
	const domContainer = document.createElement('div');
	domContainer.setAttribute('style', 'position:absolute;background:white;overflow:hidden;right:0px;bottom:0px;width:250px;height:400px;')
	const domStages = [];
	let curStage = 0;
	const styleFormat = 'background:{0};color:{1};';
	const selectedColor = 'grey';
	const enabledColor = 'red'

	stages.forEach( e => {
		const dom = document.createElement('div');
		dom.innerText = e;
		domStages.push(dom);
		domContainer.appendChild(dom);
	});
	domStages[curStage].setAttribute('style', styleFormat.format(selectedColor, 'inherit'));

	const getTextColor = function(stage) {
		return stageLoaders[stage].loaded ? enabledColor : 'inherit';
	}

	return function(key) {
		let rtn = false;
		if ( key == 't' ) {
			if ( !showStageToggle ) {
				document.body.appendChild(domContainer);
			}
			else {
				document.body.removeChild(domContainer);
			}
			showStageToggle = showStageToggle ? false : true;

		}
		else if ( showStageToggle ) {
			if ( key == 'ArrowDown' || key == 'ArrowUp' ) {
				rtn = true;
				domStages[curStage].setAttribute('style', styleFormat.format('inherit', getTextColor(curStage)));
				if ( key == 'ArrowUp' ) {
					curStage = curStage > 1 && stages.length > 1 ? curStage-1 : 0;
				}
				else if ( key == 'ArrowDown') {
					curStage = curStage < stages.length-1 ? curStage+1 : stages.length-1;
				}
				domStages[curStage].setAttribute('style', styleFormat.format(selectedColor, getTextColor(curStage)));
			}
			else if ( key == 'ArrowRight') {
				let state = stageLoaders[curStage].loaded;

				if ( !state ) {
					loadStage(curStage);
					domStages[curStage].setAttribute('style', styleFormat.format(selectedColor, enabledColor));
				}
				else {
					unloadStage(curStage);
					domStages[curStage].setAttribute('style', styleFormat.format(selectedColor, 'inherit'));
				}
				rtn = true;
			}
		}

		return rtn;
	}
})();
inputHandlers.push(handleShipStage);


const keyPress = function(key) {
	for(let handler of inputHandlers) {
		if ( handler(key) ) {
			break;
		}
	}
}
window.addEventListener('keydown', (event) => {
	keyPress(event.key)
});


const main = function() {
	Update.init();
	Renderer.init();

	Renderer.setCameraPos(new Vector3(0, 0, 5));
	let axes = new AxesHelper(10);
	axes = Renderer.add(axes);
	axes.position.set(0, 0, -99);
	Update.start();

	generateShip(curSeed);
	stageLoaders.forEach( (e, i) => loadStage(i));
}
window.addEventListener('load', main);
