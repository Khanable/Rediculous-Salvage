//Least Significant bit first
export const GetBits = function(v) {
	v = parseInt(v);
	if ( v > 0 ) {
		let totalBits = Math.floor(Math.log2(v))+1;
		let rtn = new Array(totalBits).fill(false);
		let curBit = totalBits-1;
		while(curBit >= 0) {
			let bitValue = Math.pow(2, curBit);
			if ( v >= bitValue ) {
				v-=bitValue;
				rtn[curBit] = true;
			}
			curBit-=1;
		}
		return rtn;
	}
	else if ( v == 0 ) {
		return [false];
	}
	else {
		throw new Error('Unsigned Ints only');
	}
}
