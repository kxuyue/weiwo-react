export function moneyFormat (s, n, sign) {
	if (!!s === false) {
		return '￥0.00';
	}
	n = n > 0 && n <= 20 ? n : 0;
	sign = sign || '￥';
	s = parseFloat((s + '').replace(/[^\d/.-]/g, '')).toFixed(n) + '';
	let l = s.split('.')[0].split('').reverse();
	let r = s.split('.')[1];
	let t = '';
	for (let i = 0; i < l.length; i++) {
		let a = i + 1;
		t += l[i] + (a % 3 === 0 && a !== l.length ? ',' : '');
	};
	if (!!r === false) {
		return sign + t.split('').reverse().join('');
	} else {
		return sign + t.split('').reverse().join('') + '.' + r;
	}
}