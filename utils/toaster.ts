export default {

	error(toast, error) {
		return toast.error(error, {
			duration: 7000,
			dismissible: true,
			position: 'bottom-right',
			useDefaultCss: false,
			class: 'toasting-error',
		});
	},

	success(toast, msg) {
		return toast.success(msg, {
			duration: 7000,
			dismissible: true,
			position: 'bottom-right',
			useDefaultCss: false,
			class: 'toasting-success',
		});
	},

	show(toast, msg) {
		return toast.show(msg, {
			duration: 7000,
			dismissible: true,
			position: 'bottom-right',
			useDefaultCss: false,
			class: 'toasting-default',
		});
	},

};
