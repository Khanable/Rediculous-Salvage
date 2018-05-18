export const IsInited = function(func, args) {
	if ( this._inited ) {
		return func.apply(this, args);
	}
	else {
		throw new Error('Not inited');
	}
}

export const Decorate = function(func, decorator) {
	return function() { return decorator.call(this, func, arguments) }
}

export const DecorateDescriptor = function(obj, key, decorator, accessor) {
	let all = Object.getOwnPropertyDescriptors(obj);
	if ( all[key] != undefined ) {
		let objDescriptor = Object.getOwnPropertyDescriptor(obj, key);
		let changeDescriptor = {};
		changeDescriptor[accessor] = Decorate(objDescriptor[accessor], decorator);
		Object.defineProperty(obj, key, changeDescriptor);
	}
	else {
		throw new Error('Descriptor key doesnt exist: '+key);
	}
}
