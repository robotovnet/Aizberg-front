export default {
	
	canView(permissions, alias) {
		if (permissions) {
			const inc = permissions.filter(permission => permission.policy === alias);
			return inc[0]?.policy === alias;
		}
		return false;
	},
	
	canEdit(permissions, alias) {
		return this.canView(permissions, alias);
	},
};
