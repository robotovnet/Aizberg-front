import { ActionContext } from 'vuex';

export interface RecoverPasswordState {
    timer: string,
    isOnGoing: boolean|undefined,
    codeConfirmed: boolean|undefined
}

let timer: NodeJS.Timer;

function stopTimer(context: ActionContext<RecoverPasswordState, RecoverPasswordState>) {
	localStorage.removeItem('resend_recovery_code_expiring_timer');
	if (timer) { clearInterval(timer); }
	context.commit('isOnGoing', false);
}

function startTimer(
	context: ActionContext<RecoverPasswordState, RecoverPasswordState>,
	timerInSeconds = 240,
) {
	if (timerInSeconds > 0) {
		context.commit('updateTimer', timerInSeconds--);
		context.commit('isOnGoing', true);
	} else {
		stopTimer(context);
		return;
	}
	timer = setInterval(() => {
		context.commit('updateTimer', timerInSeconds--);
		if (timerInSeconds < 0) { stopTimer(context); }
	}, 1000);
}

export default {
	namespaced: true,
	state: {
		timer: '4:00',
		isOnGoing: undefined,
		codeConfirmed: undefined,
	},
	mutations: {
		updateTimer(state: RecoverPasswordState, timerInSeconds: number) {
			const minutes = parseInt((timerInSeconds / 60).toString());
			const seconds = parseInt((timerInSeconds % 60).toString());
			state.timer = `${minutes}:${(seconds < 10) ? `0${seconds}` : seconds}`;
		},
		isOnGoing(state: RecoverPasswordState, isOnGoing: boolean) {
			state.isOnGoing = isOnGoing;
		},
		isCodeConfirm(state: RecoverPasswordState, confirm: boolean) {
			state.codeConfirmed = confirm;
		},
	},
	actions: {
		initStore(context: ActionContext<RecoverPasswordState, RecoverPasswordState>) {
			const tis = localStorage.getItem('resend_recovery_code_expiring_timer');
			const codeConfirmed = localStorage.getItem('recovery_code_confirmed');
			if (tis) {
				const seconds = (new Date().getTime() - parseInt(tis)) / 1000;
				startTimer(context, parseInt((240 - seconds).toString()));
			} else context.commit('isOnGoing', false);
			context.commit('isCodeConfirm', JSON.parse(codeConfirmed?.toLocaleLowerCase() || 'false'));
		},
		startTimer: (context: ActionContext<RecoverPasswordState, RecoverPasswordState>) => {
			localStorage.setItem('resend_recovery_code_expiring_timer', new Date().getTime().toString());
			startTimer(context);
		},
		stopTimer(context: ActionContext<RecoverPasswordState, RecoverPasswordState>) {
			localStorage.setItem('recovery_code_confirmed', 'true');
			context.commit('isCodeConfirm', true);
			stopTimer(context);
		},
		completed(context: ActionContext<RecoverPasswordState, RecoverPasswordState>) {
			localStorage.removeItem('recovery_code_confirmed');
			context.commit('isCodeConfirm', false);
		},
	},
};
