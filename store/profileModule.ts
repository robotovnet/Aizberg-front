import { ActionContext } from 'vuex';

export interface TimerState {
	emailTimer: string,
	isEmailTimerGoing: boolean | undefined,
	phoneTimer: string,
	isPhoneTimerGoing: boolean | undefined,
	codeConfirmed: boolean | undefined,
	isCodeCorrect: boolean | undefined
}

let emailTimer: NodeJS.Timer;
let phoneTimer: NodeJS.Timer;

function stopEmailTimer(context: ActionContext<TimerState, TimerState>) {
	localStorage.removeItem('resend_email_timer');
	if (emailTimer) { clearInterval(emailTimer); }
	context.commit('isEmailTimerGoing', false);
}

function stopPhoneTimer(context: ActionContext<TimerState, TimerState>) {
	localStorage.removeItem('resend_phone_timer');
	if (phoneTimer) { clearInterval(phoneTimer); }
	context.commit('isPhoneTimerGoing', false);
}

function startEmailTimer(
	context: ActionContext<TimerState, TimerState>,
	timerInSeconds = 120,
) {
	if (timerInSeconds > 0) {
		context.commit('updateEmailTimer', timerInSeconds--);
		context.commit('isEmailTimerGoing', true);
	} else {
		stopEmailTimer(context);
		return;
	}
	emailTimer = setInterval(() => {
		context.commit('updateEmailTimer', timerInSeconds--);
		if (timerInSeconds < 0) { stopEmailTimer(context); }
	}, 1000);
}

function startPhoneTimer(
	context: ActionContext<TimerState, TimerState>,
	timerInSeconds = 120,
) {
	if (timerInSeconds > 0) {
		context.commit('updatePhoneTimer', timerInSeconds--);
		context.commit('isPhoneTimerGoing', true);
	} else {
		stopPhoneTimer(context);
		return;
	}
	phoneTimer = setInterval(() => {
		context.commit('updatePhoneTimer', timerInSeconds--);
		if (timerInSeconds < 0) { stopPhoneTimer(context); }
	}, 1000);
}

export default {
	namespaced: true,
	state: {
		emailTimer: '2:00',
		isEmailTimerGoing: undefined,
		phoneTimer: '2:00',
		isPhoneTimerGoing: undefined,
		codeConfirmed: undefined,
		isCodeCorrect: false,
	},
	mutations: {
		updateEmailTimer(state: TimerState, timerInSeconds: number) {
			const minutes = parseInt((timerInSeconds / 60).toString());
			const seconds = parseInt((timerInSeconds % 60).toString());
			state.emailTimer = `${minutes}:${(seconds < 10) ? `0${seconds}` : seconds}`;
		},
		updatePhoneTimer(state: TimerState, timerInSeconds: number) {
			const minutes = parseInt((timerInSeconds / 60).toString());
			const seconds = parseInt((timerInSeconds % 60).toString());
			state.phoneTimer = `${minutes}:${(seconds < 10) ? `0${seconds}` : seconds}`;
		},
		isEmailTimerGoing(state: TimerState, payload: boolean) {
			state.isEmailTimerGoing = payload;
		},
		isPhoneTimerGoing(state: TimerState, payload: boolean) {
			state.isPhoneTimerGoing = payload;
		},

		isCodeCorrect(state: TimerState, payload: boolean) {
			state.isCodeCorrect = payload;
		},
	},
	actions: {
		initStore(context: ActionContext<TimerState, TimerState>) {
			const tis = localStorage.getItem('resend_email_timer');
			const tisp = localStorage.getItem('resend_phone_timer');
			const codeConfirmed = localStorage.getItem('recovery_email_timer');
			if (tis) {
				const seconds = (new Date().getTime() - parseInt(tis)) / 1000;
				startEmailTimer(context, parseInt((120 - seconds).toString()));
			} else context.commit('isEmailTimerGoing', false);
			context.commit('isCodeCorrect', JSON.parse(codeConfirmed?.toLocaleLowerCase() || 'false'));
			if (tisp) {
				const seconds = (new Date().getTime() - parseInt(tisp)) / 1000;
				startPhoneTimer(context, parseInt((120 - seconds).toString()));
			} else context.commit('isPhoneTimerGoing', false);
			context.commit('isCodeCorrect', JSON.parse(codeConfirmed?.toLocaleLowerCase() || 'false'));
		},
		startEmailTimer: (context: ActionContext<TimerState, TimerState>, payload) => {
			localStorage.setItem('resend_email_timer', new Date().getTime().toString());
			startEmailTimer(context, payload);
		},
		startPhoneTimer: (context: ActionContext<TimerState, TimerState>, payload) => {
			localStorage.setItem('resend_phone_timer', new Date().getTime().toString());
			startPhoneTimer(context, payload);
		},
		stopEmailTimer(context: ActionContext<TimerState, TimerState>) {
			localStorage.setItem('recovery_email_timer', 'true');
			context.commit('isCodeCorrect', true);
			stopEmailTimer(context);
		},
		stopPhoneTimer(context: ActionContext<TimerState, TimerState>) {
			localStorage.setItem('recovery_phone_timer', 'true');
			context.commit('isCodeCorrect', true);
			stopPhoneTimer(context);
		},
		completed(context: ActionContext<TimerState, TimerState>) {
			localStorage.removeItem('recovery_email_timer');
			context.commit('isCodeCorrect', false);
		},
	},
};
