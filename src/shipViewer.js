import { Ship, ShipSettings } from 'ship.js';
import { RandomFactory } from 'random.js';
import { Update } from 'update.js';
import { Renderer } from 'render.js';
import { Vector3, AxesHelper } from 'three';
import { CirclesLoader, VerticesLoader, HullLoader, HullEdgesLoader, InternalEdgesLoader, CentreLoader, ForwardLoader, ThrustersLoader } from 'shipViewerLoaders.js';
import 'string.js';
import { StorageGetOrDefault, GetBoolFromStr, GetStrFromBool } from 'util.js';
import { GetBits } from 'binary.js';


const storage = window.sessionStorage;
let shipMetaData = null;
let inputHandlers = [];
let displayUpdate = [];
let curSeed = '0';
const stages = [
	'Circles',
	'Vertices',
	'Hull',
	'HullEdges',
	'InternalEdges',
	'Centre',
	'Forward',
	'Thrusters',
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
	new ThrustersLoader(),
];
let centreAlign = false;
let forwardAlign = false;
let axes = new AxesHelper(10);
let axesTransform = null;


const addAxes = function() {
	axesTransform = Renderer.add(axes);
	axesTransform.position.set(0, 0, -99);
	storage.setItem('axes', 'true');
}


const generateShip = function(seed) {
	curSeed = seed.toString();
	const randomFactory = new RandomFactory(parseInt(seed));
	const ship = new Ship(randomFactory);
	let settings = new ShipSettings();
	shipMetaData = ship._generate(settings);

	if ( centreAlign ) {
		shipMetaData = ship._translateCentre(shipMetaData);
	}

	if ( forwardAlign ) {
		shipMetaData = ship._rotateForward(shipMetaData);
	}

	storage.setItem('curSeed', curSeed);

	stageLoaders.forEach( e => {
		if ( e.loaded ) {
			e.unload();
			e.load(shipMetaData);
		}
	});

	displayUpdate.forEach( e => e(shipMetaData) );
}

const handleSetSeed = function() {
	let domText = null;
	let showSeedInput = GetBoolFromStr(StorageGetOrDefault(storage, 'showSeedInput', 'false'));
	let numberChars = new Array(10).fill(null).map( (e, i) => i.toString() );

	domText = document.createElement('div');
	domText.setAttribute('style', 'position:absolute;top:0px;left:0px;z-index:100;width:200px;background:white;height:20px;');
	domText.innerText = curSeed;

	const attachToDom = function() {
		document.body.appendChild(domText);
	}

	if ( showSeedInput ) {
		attachToDom();
	}

	return function(key) {
		let rtn = false;

		if ( key == 's' ) {
			if ( !showSeedInput ) {
				attachToDom();
			}
			else {
				document.body.removeChild(domText);
			}
			showSeedInput = showSeedInput ? false : true;
			storage.setItem('showSeedInput', GetStrFromBool(showSeedInput));
			rtn = true;
		}
		else if ( showSeedInput ) {
			let changed = false;
			let number = numberChars.includes(key);
			let seed = curSeed;
			if ( number ) {
				seed+=key;
				changed = true;
			}
			else if ( key == 'Backspace' ) {
				seed = seed.slice(0, seed.length-1);
				changed = true;
			}
			else if ( key == 'ArrowRight' || key == 'ArrowLeft' ) {
				let change = -1;
				if ( key == 'ArrowRight' ) {
					change = 1;
				}
				seed = (Math.max(0, parseInt(seed)+change)).toString();
				changed = true;
			}

			if ( changed ) {
				domText.innerText = seed;
				generateShip(seed);
				rtn = true;
			}
		}

		return rtn;
	}
}
inputHandlers.push(handleSetSeed);


const handleShipStage = function() {
	let showStageToggle = GetBoolFromStr(StorageGetOrDefault(storage, 'showStageToggle', 'false'));
	const domContainer = document.createElement('div');
	domContainer.setAttribute('style', 'position:absolute;background:white;overflow:hidden;right:0px;bottom:0px;width:250px;height:400px;')
	const domStages = [];
	let curStage = 0;
	const styleFormat = 'background:{0};color:{1};';
	const selectedColor = 'grey';
	const enabledColor = 'red'

	const attachToDom = function() {
		document.body.appendChild(domContainer);
		domStages.forEach( (e,i) => e.setAttribute('style', getStyle(i)) );
	}

	const getTextColor = function(stage) {
		return stageLoaders[stage].loaded ? enabledColor : 'inherit';
	}
	const getSelectedColor = function(stage) {
		return stage == curStage ? selectedColor : 'inherit';
	}
	const getStyle = function(stage) {
		return styleFormat.format(getSelectedColor(stage), getTextColor(stage));
	}

	const updateStorage = function() {
		let v = 0;
		stageLoaders.forEach( (e, i) => {
			if ( e.loaded ) {
				v+=Math.pow(2, i);
			}
		});
		storage.setItem('stages', v.toString());
	}

	stages.forEach( (e,i) => {
		const dom = document.createElement('div');
		dom.innerText = e;
		domStages.push(dom);
		domContainer.appendChild(dom);
	});

	if ( showStageToggle ) {
		attachToDom();
	}

	return function(key) {
		let rtn = false;
		if ( key == 't' ) {
			if ( !showStageToggle ) {
				attachToDom();
			}
			else {
				document.body.removeChild(domContainer);
			}
			showStageToggle = showStageToggle ? false : true;
			storage.setItem('showStageToggle', GetStrFromBool(showStageToggle));

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
					stageLoaders[curStage].load(shipMetaData);
					domStages[curStage].setAttribute('style', getStyle(curStage));
				}
				else {
					stageLoaders[curStage].unload();
					domStages[curStage].setAttribute('style', getStyle(curStage));
				}
				updateStorage();
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
			storage.setItem('centreAlign', GetStrFromBool(centreAlign));
			rtn = true;
		}
		else if ( key == 'f' ) {
			forwardAlign = forwardAlign ? false : true;
			storage.setItem('forwardAlign', GetStrFromBool(forwardAlign));
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
	let axes = GetBoolFromStr(StorageGetOrDefault(storage, 'axes', 'true'));

	if ( axes ) {
		addAxes();
	}

	return function(key) {
		let rtn = false;

		if ( key == 'o' ) {
			if ( axesTransform != null ) {
				Renderer.remove(axesTransform);
				axesTransform = null;
				storage.setItem('axes', 'false');
			}
			else {
				addAxes();
				storage.setItem('axes', 'true');
			}
			rtn = true;
		}

		return rtn;
	}
}
inputHandlers.push(handleCentreAxes);


const handleThrusterKeys = function() {
	let domRoot = null;
	let shown = GetBoolFromStr(StorageGetOrDefault(storage, 'showThrusterKeys', 'false'));
	let update = function(shipMetaData) {
		if ( shown ) {
			if ( domRoot != null ) {
				document.body.removeChild(domRoot);
			}
			domRoot = document.createElement('div');
			domRoot.setAttribute('style', 'position:absolute;background:white;left:0px;bottom:0px;width:250px;height:400px;');
			let header = document.createElement('div');
			header.innerText = 'Keys: {0} | Thrusters: {1}'.format(shipMetaData.keys.length, shipMetaData.thrusters.length);
			domRoot.appendChild(header);
			shipMetaData.keys.forEach( k => {
				let e = document.createElement('div');
				e.innerText = '{0} - {1}'.format(k.key, k.thrusters.length);
				domRoot.appendChild(e);
			});

			document.body.appendChild(domRoot);
		}
		else {
			if ( domRoot != null ) {
				document.body.removeChild(domRoot);
				domRoot = null;
			}
		}
	}
	displayUpdate.push(update);

	return function(key) {
		let rtn = false;

		if ( key == 'e' ) {
			shown = shown ? false : true;
			storage.setItem('showThrusterKeys', GetStrFromBool(shown));
			update(shipMetaData);

			rtn = true;
		}

		return rtn;
	}
}
inputHandlers.push(handleThrusterKeys);



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
	Update.start();

	curSeed = StorageGetOrDefault(storage, 'curSeed', '0');
	centreAlign = GetBoolFromStr(StorageGetOrDefault(storage, 'centreAlign', 'false'));
	forwardAlign = GetBoolFromStr(StorageGetOrDefault(storage, 'forwardAlign', 'false'));

	inputHandlers = inputHandlers.map( e => e() );

	generateShip(curSeed);

	let loadStagesV = StorageGetOrDefault(storage, 'stages', Math.pow(2, stageLoaders.length)-1);
	let loadStages = GetBits(loadStagesV);
	loadStages.forEach( (e, i) => {
		if ( e ) {
			let stage = stageLoaders[i];
			stage.load(shipMetaData);
		}
	});
}
window.addEventListener('load', main);
