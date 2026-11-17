import { onBeforeUpdate, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default function useValidationHandler() {
	const localization: any = useI18n();

	const week = ref([
		{
			name: localization.t('text.mo'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.tu'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.we'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.th'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.fr'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.sa'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
		{
			name: localization.t('text.su'),
			workFrom: '',
			workTo: '',
			breakFrom: '',
			breakTo: '',
			enabled: false,
		},
	]);

	const workFrom = <any>ref([]);
	const workTo = <any>ref([]);
	const breakFrom = <any>ref([]);
	const breakTo = <any>ref([]);
	onBeforeUpdate(() => {
		workFrom.value = [];
		workTo.value = [];
		breakFrom.value = [];
		breakTo.value = [];
	});

	/* eslint-disable */
	const workTimeToJson = (workTime: string, breakTime: string) => {
		const weekJson = JSON.parse(workTime);
		const breakJson = JSON.parse(breakTime);
		let i = 0;
		for (const everyDay in week.value) {

			for (const day in weekJson) {
				if (day === week.value[i]?.name) {
					const fromTo = weekJson[day].split('-');
					let breakFromTo;
					if (breakJson) {
						breakFromTo = breakJson[day].split('-');
					}
					week.value[i].workFrom = fromTo[0];
					week.value[i].workTo = fromTo[1];

					if (breakJson) {
						week.value[i].breakFrom = breakFromTo[0];
						week.value[i].breakTo = breakFromTo[1];
					}
					week.value[i].enabled = !!fromTo.length;
				}
			}
			i++;
		}
	};
	/* eslint-enable */

	const timeToString = () => {
		const workTime: any = {};
		const breakTime = {};
		const timeArr: { workTime: string, breakTime: string, name: string } = {
			workTime: '',
			breakTime: '',
			name: '',
		};
		const result = week.value.filter(day => day.enabled)
			.map(item => {
				workTime[item.name] = `${item.workFrom}-${item.workTo}`;
				breakTime[item.name] = `${item.breakFrom}-${item.breakTo}`;
				return {
					workTime,
					breakTime,
				};
			});
		timeArr.workTime = result.length ? JSON.stringify(result[0].workTime) : '';
		timeArr.breakTime = result.length ? (JSON.stringify(result[0].breakTime)) : '';
		timeArr.name = result.length ? (JSON.stringify(Object.keys(result[0].workTime))) : '';

		return timeArr;
	};

	return {
		week,
		workFrom,
		workTo,
		breakFrom,
		breakTo,
		workTimeToJson,
		timeToString,
	};
}
