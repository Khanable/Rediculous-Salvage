if( Array.prototype.remove == undefined ) {
	Array.prototype.remove = Object.freeze(function(e) {
		let index = this.indexOf(e);
		if ( index != -1 ) {
			this.splice(index, 1);
			return e;
		}
		else {
			throw new Error('Not found');
		}
	});
}
