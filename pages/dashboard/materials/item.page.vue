<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.shop') }}</span>
				<select class="main__select select" @change="removeError(errors?.errors['shop_id'])" v-model="shop">
					<option v-if="!isEditMode" :value="shop">{{ $t('text.shop_placeholder') }}</option>
					<option :value="shop.id" :key="shop.id" selected v-for="shop in shops">
						{{ shop.city?.name }}
					</option>
				</select>
				<p v-if="errors?.errors['shop_id']" class="main__error main__error-message">{{ errors?.errors['shop_id'][0] }}</p>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.name') }}</span>
				<input
					type="text"
					v-model="title"
					@input="removeError(errors?.errors['name.0.value'])"
					class="main__input input"
					:placeholder="$t('text.title_placeholder')" />
				<p v-if="errors?.errors['name.0.value']" class="main__error main__error-message">{{ errors?.errors['name.0.value'][0] }}</p>
			</div>
			<!-- URL -->
			<div class="main__inner main__inner--short">
				<span class="main__text">
					{{ $t('text.slug') }}
					<br><span style='color:#9e9e9e;'>{{ $t('text.slug_desc') }}</span>
				</span>
				<input
					type="text"
					v-model="slug"
					class="main__input input"
					:placeholder="$t('text.slug')"
					@input="removeError(errors?.errors['url_slug'])" />
				<p v-if="errors?.errors['url_slug']" class="main__error main__error-message">{{ errors?.errors['url_slug'][0] }}</p>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">
					{{ $t('text.code') }}
					<br><span style='color:#9e9e9e;'>{{ $t('text.code_desc') }}</span>
				</span>
				<input
					type="text"
					v-model="code"
					class="main__input input"
					placeholder="Code"
					@input="removeError(errors?.errors['code'])" />
				<p v-if="errors?.errors['code']" class="main__error main__error-message">{{ errors?.errors['code'][0] }}</p>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.section') }}</span>
				<input
					type="text"
					v-model="section"
					class="main__input input"
					:placeholder="$t('text.section_placeholder')"
					@input="removeError(errors?.errors['section_name'])" />
				<p v-if="errors?.errors['section_name']" class="main__error main__error-message">{{ errors?.errors['section_name'][0] }}</p>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text"></span>
				<select class="main__select select" v-model="section">
					<option value="Название раздела" selected disabled>{{ $t('text.section_placeholder') }}</option>
					<option :value="section.section_name" :key="section.id" v-for="section in fetchedSection" selected>
						{{ section.section_name }}
					</option>
				</select>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.material_type') }}</span>
				<div class="main__block">
					<label for="status-product-checkbox1" class="checkbox-group">
						<input
							type="radio"
							value="page"
							id="status-product-checkbox1"
							name="status-product"
							class="checkbox-group__checkbox"
							v-model="materialType" />
						<span>{{ $t('text.page') }}</span>
					</label>
					<label for="status-product-checkbox2" class="checkbox-group">
						<input
							type="radio"
							value="block"
							id="status-product-checkbox2"
							name="status-product"
							class="checkbox-group__checkbox"
							v-model="materialType" />
						<span>{{ $t('text.block') }}</span>
					</label>
				</div>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">
					Keywords
					<br><span style='color:#9e9e9e;'>{{ $t('text.keywords_desc') }}</span>
				</span>
				<input
					type="text"
					v-model="keywords"
					class="main__input input"
					placeholder="Meta Keywords"
					@input="removeError(errors?.errors['meta_keywords'])" />
				<p v-if="errors?.errors['meta_keywords']" class="main__error main__error-message">
					{{ errors?.errors['meta_keywords'][0] }}
				</p>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">
					Description
					<br><span style='color:#9e9e9e;'>{{ $t('text.description_desc') }}</span>
				</span>
				<input
					type="text"
					v-model="description"
					class="main__input input"
					placeholder="Meta Description"
					@input="removeError(errors?.errors['meta_description'])" />
				<p v-if="errors?.errors['meta_description']" class="main__error main__error-message">
					{{ errors?.errors['meta_description'][0] }}
				</p>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.content') }}</span>
				<textarea
					id='editor'
					class="main__textarea textarea"
					v-model="content"
					:placeholder="$t('text.content_placeholder')"
					@input="removeError(errors?.errors['content.0.value'])"></textarea>

				<p v-if="errors?.errors['content.0.value']" class="main__error main__error-message">{{ errors?.errors['content.0.value'][0] }}</p>
			</div>
			<div class="main__inner main__inner--end">
				<label for="type-checkbox" class="checkbox-group">
					<span>{{ $t('text.to_active') }}</span>
					<input type="checkbox" v-model="isActive" id="type-checkbox" class="checkbox-group__checkbox" />
				</label>
			</div>

			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
					{{ $t('text.save_changes') }}
				</button>
				<button v-else class="btn" @click="saveOrUpdate('save')">{{ $t('text.save_changes') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { computed } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import { onMounted } from '@vue/runtime-core';
	
import '../../../extensions/Array';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import materialsService from '../../../services/materialsService';
import toaster from '../../../utils/toaster';
import shopsService from '../../../services/shopsService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();

const errorNames = [
	'code',
	'content',
	'content.*.lang',
	'content.*.value',
	'is_active',
	'meta_description',
	'meta_keywords',
	'name',
	'name.*.lang',
	'name.*.value',
	'section_name',
	'shop_id',
	'type',
	'url_slug',
];

let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('material');
const { validate, errors, removeError } = useValidationHandler();

const { create, update } = useCreateOrUpdate(materialsService, errorNames, '/dashboard/materials');

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

const sendData = computed(() => ({
	name: [
		{
			lang: localization.locale.value,
			value: title.value,
		},
	],
	shop_id: shop.value,
	url_slug: slug.value,
	code: code.value,
	section_name: section.value,
	type: materialType.value,
	is_active: isActive.value ? 'Y' : 'N',
	meta_keywords: keywords.value,
	meta_description: description.value,
	content: [
		{
			lang: localization.locale.value,
			value: editor && editor.getEditorValue ? editor.getEditorValue() : (content.value || ''),
		},
	],
}));
const material = ref();
const shop = ref(0);
const shops = ref();
const title = ref();
const slug = ref();
const code = ref();
const section = ref();
const fetchedSection = ref();
const materialType = ref('page');
const keywords = ref();
const description = ref();
const content = ref();
const isActive = ref(false);
let editor;
let loadData = false;
const loadEditorComplete = ref(false);
	
onMounted(() => {
	let editorScript = document.createElement('script');
	editorScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jodit/4.2.50/es2021/jodit.min.js');
	document.head.appendChild(editorScript);

	let editorScriptIsReady = false;
	let checkInterval = setInterval(function () {
	      if (Jodit && loadData === true) {
	        editorScriptIsReady = true;
	        clearInterval(checkInterval);

		editor = Jodit.make("#editor", {
			"language": "ru",
			"disablePlugins": "add-new-line,spellcheck,speech-recognize,search,print,powered-by-jodit,iframe,focus,ai-assistant,about",
			"defaultActionOnPaste": "insert_as_text",
			"minHeight": 400,
			"width": '70%',
			"maxWidth": '70%',
			"enter": "div",
			"spellcheck": false,
			"useSearch": false,
			"toolbarButtonSize": "middle",
			"buttons": [
				'source', '|',
				'bold',
				'strikethrough',
				'underline',
				'italic', '|',
				'align', 'undo', 'redo', '|',
				'ul',
				'ol', '|',
				'outdent', 'indent',  '|',
				'font',
				'fontsize',
				'brush',
				'paragraph', '|',
				'image',
				'link', '|',
				'fullsize',
	                ],
			"style": {
			     "font": '13px Helvetica,Arial,sans-serif',
			     "color": '#151515',
			}
		});

		if (content.value) {
			editor.setEditorValue(content.value);
		}
		
		loadEditorComplete.value = true;
	      }
	      return editorScriptIsReady;
	    }, 300);
});
	
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard/materials');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		shopsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		materialsService.getSectionsOfMaterials(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? materialsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([shops.value, fetchedSection.value, material.value] = [...values]))
		.then(() => {
			loadData = true;
			if (isEditMode.value) {
				shop.value = material.value.shop_id;
				title.value = material.value.name;
				slug.value = material.value.url_slug;
				code.value = material.value.code;
				section.value = material.value.section_name;
				materialType.value = material.value.type;
				keywords.value = material.value.meta_keywords;
				description.value = material.value.meta_description;
				content.value = material.value.content;
				isActive.value = material.value.is_active === 'Y';
			}
			store.commit('setLoading', false);
		});
});
</script>

<style lang="css" scoped>
    @import "https://cdnjs.cloudflare.com/ajax/libs/jodit/4.2.50/es2021/jodit.min.css";
</style>
