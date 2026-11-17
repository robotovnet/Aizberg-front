<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="store.state.ready">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.subsection') }}</span>
					<div class="main__block">
						<span class="main__text">{{ title }}</span>
					</div>
				</div>
				<div class="main__inner main__inner--short main__inner--top">
					<span class="main__text">{{ $t('text.starting_phrases') }}</span>
					<textarea
						@input="removeError(errors?.errors['seo.starting_phrases'])"
						class="main__textarea textarea"
						:placeholder="$t('text.starting_phrases_placeholder')"
						v-model="startingPhrases"></textarea>
					<p v-if="errors?.errors['seo.starting_phrases']" class="main__error main__error-message">
						{{ errors?.errors['seo.starting_phrases'][0] }}
					</p>
				</div>
				<div class="main__inner main__inner--short main__inner--top">
					<span class="main__text">{{ $t('text.seo_text') }}</span>

					<textarea
						@input="removeError(errors?.errors['seo.desc'])"
						class="main__textarea textarea"
						:placeholder="$t('text.seo_text_placeholder')"
						v-model="seoDesc"></textarea>
					<p v-if="errors?.errors['seo.desc']" class="main__error main__error-message">
						{{ errors?.errors['seo.desc'][0] }}
					</p>
				</div>
				<div class="main__inner main__inner--end mt-25">
					<button class="btn" @click="update">{{ $t('text.save') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';

import '../../../extensions/Array';
import viewPermissions from '../../../utils/viewPermissions';
import getValidator from '../../../validation/getValidator';
import toaster from '../../../utils/toaster';
import countriesService from '../../../services/countriesService';
import sleep from '../../../utils/sleep';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import shopsService from '../../../services/shopsService';
import catalogSectionsService from '../../../services/catalogSectionsService';
import seoDataService from '../../../services/seoDataService';

const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();
const isDefault = ref<boolean>(false);
const startingPhrases = ref();
const seoDesc = ref();

const errorNames = ['price_type_id', 'names.0.value', 'is_default'];
let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('country');
const { validate, errors, removeError } = useValidationHandler();

const sendData = computed(() => {
	const dirtyArr = startingPhrases.value ? startingPhrases?.value.split(',') : [];
	return {
		seo: {
			starting_phrases: startingPhrases.value ? dirtyArr.map(item => item.trim()) : null,
			desc: seoDesc.value ? seoDesc.value : null,
		},
	};
});

const update = async () => {
	isClicked = true;
	const response = await seoDataService.update(
		localization,
		itemId.value,
		sendData.value,
		(errMsg, _, type) =>
			(errors.value = {
				errors: {
					...errors.value?.errors,
					[type as any]: [errMsg],
				},
			}),
	);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessCreated'));
		window.location.replace('/dashboard/seo-catalog/');
	}
};
const canSave = computed(() => {
	return false;
});
const title = ref();

onMounted(async () => {
  	document.title += ` - ${localization.t('text.title')}`;

	const subSection = await catalogSectionsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
	
	startingPhrases.value = subSection.seo_starting_phrases?.join(', ');
	seoDesc.value = subSection?.seo_desc;
	title.value = subSection.name;  
});
</script>
