<template>
	<div class="upload-file">
		<div class="upload-file__body position-relative" :class="{ 'upload-file__body__files-hover': isFilesHover }">
			<input
				type="file"
				class="position-absolute opacity-0 width-100 height-100"
				@change="onFilesSelect"
				multiple
				ref="input"
				accept="image/*"
				@dragenter="isFilesHover = true"
				@dragleave="isFilesHover = false"
				@drop="isFilesHover = false" />
			<div class="upload-file__inner upload-file__inner--bottom">
				<div class="upload-file__icon">
					<img src="../../assets/img/dist/sprite.svg#icon-upload-file" alt="Upload file" />
				</div>
				<span>{{ $t('text.upload_area') }}</span>
			</div>
			<div class="upload-file__inner">
				<span>{{ $t('text.main_one') }}</span>
				<button class="btn" @click="filesSelect">{{ $t('text.choose_photo') }}</button>
			</div>
		</div>

		<div class="upload-file__list wrap">
			<div :key="idx" class="upload-file__item" v-for="(file, idx) in modelValue">
				<div class="upload-file__img">
					<img :src="getSrc(file)" alt="Photo" />
				</div>
				<div class="d-flex justify-content-center">
					<div v-if="loading[idx + 1] !== 100">
						<a href="" @click.prevent="removeFile(file)" class="upload-file__link">{{ $t('text.remove') }}</a>
					</div>
					<div v-else :style="{ width: loading[idx + 1] + 'px' }" class="loading-class">{{ loading[idx + 1] }}%</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { inject, ref, defineComponent, PropType, toRefs } from 'vue';
import { useStore } from 'vuex';
import toaster from '../../utils/toaster';
import { MainState } from '../../store/mainStore';
export default defineComponent({
	props: {
		modelValue: {
			type: Array as PropType<Array<File>>,
			required: true,
		},

		loading: {
			type: Array,
			required: true,
		},
	},

	emits: ['update:modelValue', 'uploadInit'],

	setup(props, { emit }) {
		const store = useStore<MainState>();
		const toast = inject('toast') as any;
		const imageRef = ref([]);
		const { modelValue, loading } = toRefs(props);

		const input = ref<HTMLInputElement | null>(null);
		const isFilesHover = ref<Boolean>(false);

		const filesSelect = () => {
			if (input.value) input.value.click();
		};

		const onFilesSelect = ({ currentTarget }) => {
			if (currentTarget.files) {
				emit('update:modelValue', [...modelValue.value, ...Array.from(currentTarget.files)]);
				emit('uploadInit');
			}
			if (input.value) input.value = null;
		};

		const getSrc = file => {
			const imgObj = new Image();
			const objectUrl = URL.createObjectURL(file);
			imgObj.src = objectUrl;
			imgObj.onload = function () {
				if (this.width < 100 || this.height < 100) {
					toaster.error(toast, 'Размер изображения должен быть менее более 100*100 px.');
					store.commit('setPictureError', true);
					removeFile(file);
				}
			};
			if (file.size > 10 * 1024 * 1024) {
				toaster.error(toast, 'Размер изображения не должен превышать 10 МБ.');
				store.commit('setPictureError', true);
				removeFile(file);
			}
			return objectUrl;
		};

		const removeFile = img => {
			store.commit('setPictureError', false);
			emit(
				'update:modelValue',
				modelValue.value.filter((file, idx) => modelValue.value[idx] !== img),
			);
		};

		return {
			imageRef,
			input,
			isFilesHover,
			loading,
			getSrc,
			filesSelect,
			onFilesSelect,
			removeFile,
		};
	},
});
</script>
