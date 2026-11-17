import { ref } from 'vue';
import { useStore } from 'vuex';
import { MainState } from '../../../../store/mainStore';
import getValidator from '../../../../validation/getValidator';

export default function useValidationHandler() {
	const errors = ref();
	const store = useStore<MainState>();
	const validate = (isClicked: boolean, item: object): boolean => {
		const validation: any = store.state.currentValidation;
		if (isClicked) {
			const validator: any = getValidator(item, validation);

			if (validator.fails()) {
				errors.value = validator.errors;
				return false;
			}
			errors.value = [];

			return true;
		}
		return true;
	};
	return {
		validate,
		errors,
	};
}
