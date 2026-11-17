if (typeof window !== 'undefined') {
	// eslint-disable-next-line no-extend-native
	Object.defineProperty(Object.prototype, 'parseErrors', {
		value(
			errors: string[],
			onError: (err: string, type?: string) => void,
			onTooManyRequests?: () => void,
		) {
			if (this.response && this.response.status === 401 && window.location.pathname !== '/staff/login') {
				window.location.replace('/staff/logout');
			} else if (this.response && this.response.status === 429) {
				onTooManyRequests?.();
			} else if (this.response && this.response.data && this.response.data.errors) {
				//console.log(this.response.data.errors);
				
				if (Array.isArray(this.response.data.errors)) {
					for (const error of this.response.data.errors) {
						onError(error);
					}
					return
				}

				if (Array.isArray(this.response.data.errors?.delete)) {
					for (const error of this.response.data.errors?.delete) {
						onError(error);
					}
					return
				}

				if (Array.isArray(this.response.data.errors?.email)) {
					for (const error of this.response.data.errors?.email) {
						onError(error);
					}
					return
				}

				if (Array.isArray(this.response.data.errors?.phone)) {
					for (const error of this.response.data.errors?.phone) {
						onError(error);
					}
					return
				}
				
				for (const err in this.response.data.errors) {
					if (errors.length && errors.includes(err)) {
						onError(this.response.data.errors[err]?.[0], err);
					} else if (this.message) {
						onError(this.message);
					}
				}
			} else if (this.response && this.response.data && this.response.data.message) {
				onError(this.response.data.message);
			} else if (this.message) {
				onError(this.message);
			}
		},
	});
}
