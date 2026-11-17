import IMask from "imask";


export default {
	mask: 'HH:MM',
	blocks: {
		'HH': {
			mask: IMask.MaskedRange,
			from: 0,
			to: 23,
			maxLength: 2,
			lazy: false
		},
		'MM': {
			mask: IMask.MaskedRange,
			from: 0,
			to: 59,
			maxLength: 2,
			lazy: false
		}
	}
}
