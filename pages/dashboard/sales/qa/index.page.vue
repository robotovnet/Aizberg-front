<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div class="list list--three list--goods">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.question') }}</span>
				<span class="list__heading">{{ $t('text.question_time') }}</span>
				<span class="list__heading">{{ $t('text.to_answer') }}</span>
			</div>
			<form class="main__content">
				<div class="main__group">
					<label class="checkbox-group">
						<input type="checkbox" v-model="isReplied" @change="filter(isReplied)" class="checkbox-group__checkbox" />
						<span>{{ $t('text.without_answer') }}</span>
					</label>
				</div>
			</form>
			<div :key="index" class="list__item" v-for="(qa, index) in allQa">
				<div class="list__elem">
					<div class="main__product">
						<div class="main__group">
							<span class="main__text main__text--grey">{{ qa.product_id }}</span>
							<a :href="removeSubdomain(qa.product_url)" target='_blank' title="" class="main__product-name"> {{ qa.product_name }}</a>
						</div>
						<div class="main__group" style="margin-top: 12px; align-items: baseline;">
							<b>{{ $t('text.question') }}</b>: {{ qa.content }}
						</div>
						<div class="main__group" style="align-items: baseline;">
							<span v-if="qa.answer_text"><b>{{ $t('text.answer') }}</b>: {{ qa.answer_text }} (<span style='color: olive'>{{ qa.staff_name }}</span>)</span>
							<span v-if="qa.answer_text === null || qa.answer_text === ''"><b>{{ $t('text.answer') }}</b>: <span style='color: red;'>{{ $t('text.without_staff_answer') }}</span></span>
						</div>

						<div class="main__group" v-show="showFormAnswer[qa.id]" style="width:80%;">
							<textarea
								v-model="answers[qa.id]"
								style="width: 100%;"
								class="main__textarea main__textarea--md textarea"
								:placeholder="$t('text.input_answer')"></textarea>
						</div>

						<div class="main__group" v-show="showFormAnswer[qa.id]">
							<button class="main__btn main__btn--standart" @click.prevent="answerSave(qa.id)">{{ $t('text.save_answer') }}</button>
							<a @click.prevent="showFormAnswer[qa.id]=false" style='margin-left:20px;' href='javascript:void(0);'>{{ $t('text.close') }}</a>
						</div>
						
						<div class="main__group">
							<span class="main__product-code">{{ $t('text.client') }}: {{ qa.client_name }}</span>
							<span class="main__product-code">{{ $t('text.phone') }}: +{{ qa.client_phone }}</span>
							<span class="main__product-code">{{ $t('text.email') }}: <a :href="`mailto:${qa.client_email}`">{{ qa.client_email }}</a></span>
						</div>
					</div>
				</div>
				<span class="list__elem">{{ qa.created_at }}</span>
				<span class="list__elem">
					<button class="main__btn main__btn--standart" @click.prevent="answer(qa.id)">{{ $t('text.to_answer') }}</button>
					<a @click.prevent="deleteQa(qa.id)" style='margin-top: 18px; color:darkred;' href='javascript:void(0);'>{{ $t('text.delete') }}</a>
				</span>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total_questions') }}: {{ totalQa }}</p>
				<div class="pagination" v-if="totalQa > itemsOnPage">
					<app-pagination
						v-model="page"
						:page-count="pageCount"
						:margin-pages="2"
						:page-range="3"
						@input="currentPageHandler"
						:container-class="'pagination__list'"
						:page-class="'pagination__item'"
						:active-link-class="'active'"
						:page-link-class="'pagination__link'"
						:break-view-class="''"
						:break-view-link-class="''"
						:first-last-button="false"
						:nextLinkClass="'next-class'"
						:hide-prev-next="true" />
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { response } from 'express';
import { MainState } from '../../../../store/mainStore';

import toaster from '../../../../utils/toaster';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import qaService from '../../../../services/qaService';
import sleep from '../../../../utils/sleep';
import AppPagination from '../../../_components/AppPagination.vue';
import redirect from '../../../../utils/redirect';
import { removeSubdomain } from '../../../../utils/constants';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const dayJs = inject('dayJS') as any;
const allQa = ref();
const answers = ref([]);
const showFormAnswer = ref([]);

const { canEdit, canView, itemId, isEditMode } = usePageInit('qa');

const itemsOnPage = ref(50);
const totalQa = ref();
const page = ref(1);
const pageCount = computed(() => Math.ceil(totalQa.value / itemsOnPage.value));

const isReplied = ref(false);

onBeforeMount(async () => {
	if (!canView) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
});

const isRepliedString = computed(() => (isReplied.value ? '&isReplied=N' : ''));
const queryString = computed(() => isRepliedString.value);
const errorNames = ref();

const currentPageHandler = async (currentPage = page.value) => {
	await sleep(1);
	store.commit('setLoading', true);
	allQa.value = await qaService.getAll(localization, currentPage.toString(), queryString.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	const total: any = await qaService.total(localization, queryString.value, errMsg => toaster.error(toast, errMsg));
	totalQa.value = total.total;
	store.commit('setLoading', false);
};

const answer = async (QaId: any) => {
	if (typeof showFormAnswer.value[QaId] === 'undefined') {
		showFormAnswer.value[QaId] = true;
	} else if (showFormAnswer.value[QaId] === false) {
		showFormAnswer.value[QaId] = true;
	} else {
		showFormAnswer.value[QaId] = false;
	}
};

const answerSave = async (QaId: any) => {
	allQa.value.forEach((qaData, index) => {
		if(qaData.id == QaId) {
			allQa.value[index].answer_text = answers.value[QaId];
		}
	});

	showFormAnswer.value[QaId] = false;
	
	await qaService.answer(localization, answers.value[QaId], QaId, errMsg => toaster.error(toast, errMsg));
	answers.value[QaId] = "";
	
};

const filter = async (isReplied: any) => {
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
};

const deleteQa = async (QaId: any) => {
	if (window.confirm(localization.t('text.confirm_delete'))) {
		allQa.value = allQa.value.filter(qaData => qaData.id !== QaId);
		await qaService.delete(localization, QaId, errMsg => toaster.error(toast, errMsg));
	}
};
	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
