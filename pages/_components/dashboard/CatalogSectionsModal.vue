<template>
	<div class="modal" :class="activeCls">
		<div class="modal__wrapper modal__wrapper--lg">
			<div class="modal__top">
				<h2 class="modal__title">{{ $t('text.choose_subsection_title') }}</h2>
			</div>
			<div class="list list--four list--directory mb-25">
				<div class="list__wrap">
					<template v-for="catalogSection in tree">
						<label
							:for="catalogSection.id"
							class="list__item list__item--main checkbox-group"
							:class="{ 'ns-yml': !catalogSection.children?.length }">
							<span class="list__elem">
								<input
									@change="checkChildren(catalogSection)"
									type="checkbox"
									:id="catalogSection.id"
									v-model="catalogSection.checked"
									class="checkbox-group__checkbox list__edit" />
								<span>{{ catalogSection.name }}</span>
							</span>
							<span class="list__elem"></span>
							<span class="list__elem"></span>
							<span class="list__elem"></span>
						</label>
						<template v-if="catalogSection.children?.length">
							<template v-for="(child, index) in catalogSection.children" :key="child.id">
								<label
									:for="child.id"
									class="list__item checkbox-group"
									:class="{ 'list__item--last': index === catalogSection.children.length - 1 }">
									<span class="list__elem">
										<input
											type="checkbox"
											:id="child.id"
											v-model="child.checked"
											class="checkbox-group__checkbox list__edit" />
										<span>{{ child.name }}</span>
									</span>
									<span class="list__elem"></span>
									<span class="list__elem"></span>
									<span class="list__elem"></span>
								</label>
								<template v-if="child.children?.length">
									<template v-for="(subChild, idx) in child.children" :key="subChild.id">
										<label
											:for="subChild.id"
											class="list__item list__item--sub checkbox-group"
											:class="{ ' list__item--last': idx === child.children.length - 1 }">
											<span class="list__elem">
												<input
													type="checkbox"
													:id="subChild.id"
													v-model="subChild.checked"
													class="checkbox-group__checkbox list__edit" />
												<span>{{ subChild.name }}</span>
											</span>
											<span class="list__elem"></span>
											<span class="list__elem"></span>
											<span class="list__elem"></span>
										</label>
									</template>
								</template>
							</template>
						</template>
					</template>
				</div>
			</div>
			<div class="modal__inner modal__inner--center mb-25">
				<button class="btn" @click="update">
					{{ $t('text.save_changes') }}
				</button>
			</div>
			<button class="modal__close" @click="$emit('close')" title="Закрыть">Закрыть</button>
		</div>
	</div>
	<div class="modal-overlay" @click.self="$emit('close')" :class="overlayCls"></div>
</template>

<script setup lang="ts">
import { defineProps, inject, ref, toRefs, watch, defineEmits, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useMakeTree from '../../../composables/pages/dashboard/catalogSections/useMakeTree';

const toast = inject('toast') as any;
const localization: any = useI18n();
const emit = defineEmits(['close', 'update']);
const props = defineProps<{
	isVisible: Boolean;
	catalogSections: any;
	productTypes: any;
}>();

const activeCls = ref('');
const overlayCls = ref('');

const { isVisible, catalogSections, productTypes } = toRefs(props);

const { tree, makeTree } = useMakeTree();
const checkChildren = catalogSection => {
	if (catalogSection.children.length)
		if (catalogSection.checked) {
			catalogSection.children.forEach(child => (child.checked = true));
		} else {
			catalogSection.children.forEach(child => (child.checked = false));
		}
};
const treeInit = async () => {
	makeTree(catalogSections.value, productTypes.value);
};

const update = async () => {
	let checkedSectionsIds: any = [];
	tree.value.forEach(parent => {
		if (parent.checked) {
			checkedSectionsIds.push(parent.id);
		}
		parent.children.forEach(child => {
			if (child.checked) {
				checkedSectionsIds.push(child.id);
			}
			child.children.forEach(subChild => {
				if (subChild.checked) {
					checkedSectionsIds.push(subChild.id);
				}
			});
		});
	});
	checkedSectionsIds = Array.from(
		new Set(
			checkedSectionsIds.map(s => {
				return s;
			}),
		),
	);
	emit('update', checkedSectionsIds);
	emit('close');
};

const toggleDialog = show => {
	if (show) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'modal-overlay--active';
		treeInit();
	} else {
		activeCls.value = '';
		overlayCls.value = '';
		emit('close');
	}
};

watch(
	() => isVisible.value,
	() => toggleDialog(isVisible.value),
);
</script>
