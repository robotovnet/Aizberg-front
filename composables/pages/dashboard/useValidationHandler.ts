import { ref } from 'vue';
import { useStore } from 'vuex';
import { MainState } from '../../../store/mainStore';
import getValidator from '../../../validation/getValidator';

export default function useValidationHandler(anotherValidation: any = null) {
	const errors = ref();
	const store = useStore<MainState>();
	const validate = (isClicked: boolean, item: object): boolean => {
		let validation: any;
		if (anotherValidation) {
			validation = anotherValidation;
		} else {
			validation = store.state.currentValidation;
		}
		if (isClicked) {
			const validator: any = getValidator(item, validation);
			if (validator.fails()) {
				errors.value = validator.errors;
				return false;
			}
			errors.value = [];
			return true;
		}
		return false;
	};
	const removeError = (err) => {
		if (err) {
			for (const error in errors.value.errors) {
				if (err === errors.value.errors[error]) {
					delete errors.value.errors[error];
				}
			}
		}
	};
	return {
		validate,
		errors,
		removeError,
	};
}
