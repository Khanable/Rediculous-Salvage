if ( !String.prototype.format ) {
	String.prototype.format = function() {
		let args = arguments;
		return this.replace(/{(\d+)}/g, function(match, num) {
			return args[num] != undefined ? args[num] : match;
		})
	}
}
else {
	throw new Error('String.format already exists, cannot extend');
}
