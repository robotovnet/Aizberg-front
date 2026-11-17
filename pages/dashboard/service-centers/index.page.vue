<template>
    <AppPage
	:button-text="$t('text.add_service_button')"
	:handler="() => (window.location.href = '/dashboard/service-centers/item')"
	:title="$t('text.header')"
	:canEdit="canEdit">

	<form action="" class="main__content main__content--bdb">
	    <div class="main__inner">
		<div style='width: 100%; text-align: right;'>{{ $t('text.city') }}</div>
		<select class="sel-25 select" style='margin-left: 20px;' @change="changeCityHandler" v-model="city">
			<option value="0">{{ $t('text.city_select') }}</option>
			<option v-for="(city, idx) in cities" :value="city.id" :key="idx">
				{{ city.name }}
			</option>
		</select>
	    </div>
	</form>
	
	<div class="list list--four" v-if="canView">
	    <div class="list__topping">
		<span class="list__heading">{{ $t('text.sc') }}</span>
		<span class="list__heading">{{ $t('text.city') }}</span>
		<span class="list__heading">{{ $t('text.delete') }}</span>
	    </div>
	    <div :key="idx" class="list__item" v-for="(sc, idx) in services">
		<span class="list__elem">
		    <button
			:disabled="!canEdit"
			class="list__edit"
			@click="window.location.href = `/dashboard/service-centers/item?edit=${sc?.id}`"
			:title="$t('text.edit')"></button>
		    <span>{{ sc.name }}</span>
		</span>
		<span class="list__elem">
			{{ sc?.city?.name }}
		</span>
		<span class="list__elem">
		    <button
			:disabled="!canEdit"
			class="cross"
			:title="$t('text.delete')"
			@click="onConfirmDelete(sc?.id, sc?.name)"></button>
		</span>
	    </div>
	</div>
	<div class="main__bottom">
	    <div class="main__inner">
		<div class="main__text"></div>
		<div class="pagination">
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
	<AskDialog
	    :deleteId="itemId?.toString()"
	    :title="$t('text.dialog_delete_title')"
	    :question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
	    :onConfirm="deleteServiceCenter" />
    </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import '../../../extensions/Array';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import serviceCenterService from '../../../services/serviceCenterService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';
import AppPagination from '../../_components/AppPagination.vue';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const services = ref();
const city = ref(0);
const cities = ref(0);
	
const page = ref(1);
const totalAmount = ref();
const itemsPerPage = ref();
const currentPageBuffer = ref();
    
const currentPageHandler = async currentPage => {
    currentPageBuffer.value = currentPage;

    store.commit('setLoading', true);
    services.value = await serviceCenterService.getAll(localization, currentPage, city.value, errMsg =>
	toaster.error(toast, errMsg),
    );
    store.commit('setLoading', false);
    const total: any = await serviceCenterService.total(localization, city.value, errMsg => toaster.error(toast, errMsg));
    totalAmount.value = total.total_amount;
    itemsPerPage.value = total.total_per_page;
};

const pageCount = computed(() => Math.ceil(totalAmount.value / itemsPerPage.value));
    
const servicesData = <any>ref();
const { canEdit, canView } = usePageInit('servicecenter');

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(serviceCenterService);

const changeCityHandler = () => {
	pageInit();
};

const deleteServiceCenter = async () => {
	await onDelete(itemId.value);
	pageInit();
};

onBeforeMount(async () => {
    pageInit();
});

const pageInit = async () => {
    if (!canView.value) redirect('/dashboard');
    await sleep(1);
    store.commit('setLoading', true);
    let total;
    const a = Promise.all([
	serviceCenterService.getAll(localization, page.value, city.value, errMsg => toaster.error(toast, errMsg)),
	serviceCenterService.total(localization, city.value, errMsg => toaster.error(toast, errMsg)),
	serviceCenterService.getCities(localization, errMsg => toaster.error(toast, errMsg)),
    ])
	.then(values => ([servicesData.value, total, cities.value] = [...values]))
	.then(() => {
	    totalAmount.value = total.total_amount;
	    itemsPerPage.value = total.total_per_page;

	    services.value = servicesData.value;
	});
    a.then(() => {
	store.commit('setLoading', false);
    });
};
	
onMounted(() => {
    document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--four .list__elem:first-child, .list--four .list__heading:first-child {
    max-width: 300px !important;
}
</style>
