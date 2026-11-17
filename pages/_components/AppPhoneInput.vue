<template>
	<input
		type="tel"
		@focus="onFocus"
		@click="onFocus"
		@input="input"
		:disabled="disabled"
		class="main__input input"
		v-model="inputData"
		ref="inpt"
		placeholder="+7 (000) 000-00-00" />
</template>

<script lang="ts">
/* v-on:keydown="filterInputKeys($event)" */
import { computed, nextTick, onMounted, watch } from '@vue/runtime-core';
import { ref } from 'vue';
import IMask from 'imask';
import phoneMask from '../../validation/phone/phoneMask';
import { useStore } from 'vuex';
import { MainState } from '../../store/mainStore';
export default {
	props: {
		text: {
			type: String,
			// required: true
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		phoneMask: {
			type: String,
			required: true,
		},
	},

	emits: ['update:text', 'validate'],

	setup(props, { emit }) {
		const inputData = ref('');
		const inpt: any = ref(null);
		let defaultMask = true;
		let active = false;
		const errs = ref(props.errors);
		const store = useStore<MainState>();
		const phoneMaskDef = ref("+{7} (000) 000-00-00");
		
		const filterInputKeys = (evnt: any) => {

			/*
			errs.value = '&nbsp;';
			if (!defaultMask) {
				return;
			}
			const kc = evnt.which || evnt.keyCode;
			const keyCode = kc === 229 ? 8 : kc;
			if (keyCode === 9) {
				return;
			}
			// eslint-disable-next-line no-param-reassign
			evnt.kc = keyCode;
			if (keyCode === 13) {
				props.onEnter!();
			} else if (inputData.value) {
				phoneMask.filterMask!(inputData.value, evnt, (newValue: string) => {
					inputData.value = newValue;
				});
			} else if (keyCode === 32) {
				evnt.preventDefault();
			}
   			*/
		};
		
		watch(inputData, () => {
			if (!defaultMask) {
				return;
			}
			
			/*
			if (props.text) {
				if (active && inputData.value === '') {
					inputData.value = '+';
				} else {
					phoneMask.watchMask(inputData.value, (newValue: string) => {
						inputData.value = newValue;
					});
				}

			}
   			*/
			
			emit('update:text', inputData.value);
		});

		onMounted(() => {
			IMask(inpt.value, { 
				mask: phoneMaskDef.value,
				prepare: function (appended, masked) {
					if (masked.mask === "+{7} (000) 000-00-00") {
						if (appended === '8' && masked.value === '') {
							return '';
						}
				
						if (appended === '7' && masked.value === '') {
							return '';
						}
				
						if (appended === '8' && masked.value === '+7 (') {
							return '';
						}
				
						if (appended === '7' && masked.value === '+7 (') {
							return '';
						}
					}
			
					return appended;
				},
			});
			
			inpt.value.addEventListener('textInput', (evnt: any) => {});
		});

		watch(
			() => props.phoneMask,
			() => {
				if (!props.phoneMask) {
					return;
				}
				
				//defaultMask = props.phoneMask?.replace(/ /g, '').startsWith('+{7}');
				//if (!defaultMask) {
				//	const maskOptions = {
				//		mask: props.phoneMask,
				//	};
				//	IMask(inpt.value, maskOptions);
				//}

				inputData.value = '';
				emit('update:text', inputData.value);
			},
		);

		watch(
			() => props.text,
			() => {
				//phoneMask.watchMask(props.text, (newValue: string) => {
				//	inputData.value = newValue;
				//});
			},
		);
		const input = () => {
			emit('validate');
		};
		return {
			filterInputKeys,
			errs,
			inpt,
			inputData,
			input,
			onFocus: () => {
				if (!defaultMask) {
					return;
				}
				active = true;
				//if (inputData.value === '') {
				//	inputData.value = '+';
				//}
			},
		};
	},
};
</script>
