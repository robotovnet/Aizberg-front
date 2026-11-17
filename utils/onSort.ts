export default (reverse, entity, localStorageName, sortName) => {
	if (!Array.isArray(entity)) return;
	const sort = localStorage.getItem(localStorageName);
	switch (sort) {
	case 'ascending':
		if (reverse) {
			entity.sortDescendantByField(sortName);
		} else {
			entity.sortAscendantByField(sortName);
		}
		localStorage.setItem(localStorageName, (reverse) ? 'descending' : 'ascending');
		break;
	default:
		if (reverse) {
			entity.sortAscendantByField(sortName);
		} else if (sort === 'descending') entity.sortDescendantByField(sortName);
		if (sort || reverse) localStorage.setItem(localStorageName, (reverse) ? 'ascending' : 'descending');
	}
};
