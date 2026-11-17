import { ref } from 'vue';

export default function useMakeTree() {
	const tree = ref([]) as any;
	const makeTree = (catalogSections, productTypes) => {
		const sections = JSON.parse(JSON.stringify(catalogSections));
		for (const catalogSection of sections) {
			productTypes.forEach(type => {
				if (catalogSection.product_group_id === type.id) catalogSection.product_name = type.plural_name;
			});
			if (catalogSection.parent_section_id === null) {
				tree.value.push(catalogSection);
			}
		}
		tree.value.forEach(mainSection => {
			// eslint-disable-next-line no-param-reassign
			mainSection.children = [];
			for (const catalogSection of sections) {
				if (mainSection.id === catalogSection.parent_section_id) {
					mainSection.children.push(catalogSection);
				}
			}
			if (mainSection.children.length) {
				for (const section of mainSection.children) {
					section.children = [];
					for (const catalogSection of sections) {
						if (catalogSection.parent_section_id === section.id && catalogSection.parent_section_id !== null) {
							section.children.push(catalogSection);
						}
					}
				}
			}
		});
		return tree.value;
	};
	return {
		makeTree,
		tree,
	};
}
