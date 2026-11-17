export default (filters: string[], validation?: {[property: string]: any}) => {
	if (!validation) return {};
	const newValidation = JSON.parse(JSON.stringify(validation));
	for (const filter of filters) {
		delete newValidation.attributes[filter];
		delete newValidation.rules[filter];
	}
	delete newValidation.masks;
	return newValidation;
};
