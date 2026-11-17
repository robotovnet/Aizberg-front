import Validator from 'validatorjs';
import en from 'validatorjs/src/lang/en';
import ru from 'validatorjs/src/lang/ru';

Validator.useLang('ru');
Validator.setMessages('ru', ru);

export default (data: { [property: string]: string } | object, validation: { [property: string]: any }) => {
	if (!validation.rules || !validation.messages) {
		return undefined;
	}


	const validator = new Validator(
		data,
		validation.rules,
		validation.messages,
	);
	if (validation.attributes) {
		validator.setAttributeNames(validation.attributes);
	}
	return validator;
};
