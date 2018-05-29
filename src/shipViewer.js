import { Ship, ShipSettings } from 'ship.js';
import { RandomFactory } from 'random.js';
import { Update } from 'update.js';
import { Renderer } from 'render.js';
import { Vector3, AxesHelper } from 'three';
import { CirclesLoader, VerticesLoader, HullLoader, HullEdgesLoader, InternalEdgesLoader, CentreLoader, ForwardLoader } from 'shipViewerLoaders.js';
import 'string.js';
import { StorageGetOrDefault } from 'util.js';


let shipMeshData = null;
const inputHandlers = [];
let curSeed = '0';
const stages = [
	'Circles',
	'Vertices',
	'Hull',
	'HullEdges',
	'InternalEdges',
	'Centre',
	'Forward',
];
const stagesEnum = {}
const stageLoaders = [
	new CirclesLoader(),
	new VerticesLoader(),
	new HullLoader(),
	new HullEdgesLoader(),
	new InternalEdgesLoader(),
	new CentreLoader(),
	new ForwardLoader(),
];
let centreAlign = false;
let forwardAlign = false;
let axes = new AxesHelper(10);
let axesTransform = null;


const addAxes = function() {
	axesTransform = Renderer.add(axes);
	axesTransform.position.set(0, 0, -99);
}

const loadStage = function(stage) {
	stageLoaders[stage].load(shipMeshData);
}
const unloadStage = function(stage) {
	stageLoaders[stage].unload();
}


const generateShip = function(seed) {
	curSeed = seed.toString();
	const randomFactory = new RandomFactory(parseInt(seed));
	const ship = new Ship(randomFactory);
	let settings = new ShipSettings();
	shipMeshData = ship._generateMesh(settings);

	if ( centreAlign ) {
		shipMeshData = ship._translateCentre(shipMeshData);
	}

	if ( forwardAlign ) {
		shipMeshData = ship._rotateForward(shipMeshData);
	}

	stageLoaders.forEach( e => {
		if ( e.loaded ) {
			e.unload();
			e.load(shipMeshData);
		}
	});
}

const handleSetSeed = function() {
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
}
inputHandlers.push(handleSetSeed);


const handleShipStage = function() {
	let showStageToggle = false;
	const domContainer = document.createElement('div');
	domContainer.setAttribute('style', 'position:absolute;background:white;overflow:hidden;right:0px;bottom:0px;width:250px;height:400px;')
	const domStages = [];
	let curStage = 0;
	const styleFormat = 'background:{0};color:{1};';
	const selectedColor = 'grey';
	const enabledColor = 'red'

	const getTextColor = function(stage) {
		return stageLoaders[stage].loaded ? enabledColor : 'inherit';
	}
	const getSelectedColor = function(stage) {
		return stage == curStage ? selectedColor : 'inherit';
	}
	const getStyle = function(stage) {
		return styleFormat.format(getSelectedColor(stage), getTextColor(stage));
	}

	stages.forEach( (e,i) => {
		const dom = document.createElement('div');
		dom.innerText = e;
		domStages.push(dom);
		domContainer.appendChild(dom);
	});


	return function(key) {
		let rtn = false;
		if ( key == 't' ) {
			if ( !showStageToggle ) {
				document.body.appendChild(domContainer);
				domStages.forEach( (e,i) => e.setAttribute('style', getStyle(i)) );
			}
			else {
				document.body.removeChild(domContainer);
			}
			showStageToggle = showStageToggle ? false : true;

		}
		else if ( showStageToggle ) {
			if ( key == 'ArrowDown' || key == 'ArrowUp' ) {
				rtn = true;
				let lastStage = curStage;
				if ( key == 'ArrowUp' ) {
					curStage = curStage > 1 && stages.length > 1 ? curStage-1 : 0;
				}
				else if ( key == 'ArrowDown') {
					curStage = curStage < stages.length-1 ? curStage+1 : stages.length-1;
				}
				domStages[lastStage].setAttribute('style', getStyle(lastStage));
				domStages[curStage].setAttribute('style', getStyle(curStage));
			}
			else if ( key == 'ArrowRight') {
				let state = stageLoaders[curStage].loaded;

				if ( !state ) {
					loadStage(curStage);
					domStages[curStage].setAttribute('style', getStyle(curStage));
				}
				else {
					unloadStage(curStage);
					domStages[curStage].setAttribute('style', getStyle(curStage));
				}
				rtn = true;
			}
		}

		return rtn;
	}
}
inputHandlers.push(handleShipStage);


const handleShipTransformation = function() {
	return function(key) {
		let rtn = false;

		if ( key == 'c' ) {
			centreAlign = centreAlign ? false : true;
			rtn = true;
		}
		else if ( key == 'f' ) {
			forwardAlign = forwardAlign ? false : true;
			rtn = true;
		}

		if ( rtn ) { 
			generateShip(curSeed);
		}

		return rtn;
	}
}
inputHandlers.push(handleShipTransformation);


const handleCentreAxes = function() {
	return function(key) {
		let rtn = false;

		if ( key == 'o' ) {
			if ( axesTransform != null ) {
				Renderer.remove(axesTransform);
				axesTransform = null;
			}
			else {
				addAxes();
			}
			rtn = true;
		}

		return rtn;
	}
}
inputHandlers.push(handleCentreAxes);



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

const getBoolFromStr = function(str) {
	return str.toLowerCase() == 'false' ? false : true;
}

const main = function() {
	Update.init();
	Renderer.init();

	Renderer.setCameraPos(new Vector3(0, 0, 5));
	Update.start();

	curSeed = StorageGetOrDefault('curSeed', '0');
	centreAlign = getBoolFromStr(StorageGetOrDefault('centreAlign', 'false'));
	forwardAlign = getBoolFromStr(StorageGetOrDefault('forwardAlign', 'false'));
	let loadStages = StorageGetOrDefault('stages', Math.pow(2, stageLoaders.length)-1);
	console.log(loadStages)

	inputHandlers.map( e => e() );

	generateShip(curSeed);
	stageLoaders.forEach( (e, i) => loadStage(i) );
	addAxes();

}
window.addEventListener('load', main);
