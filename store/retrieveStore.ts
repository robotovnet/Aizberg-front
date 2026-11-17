import loginModule from './loginModule';
import recoverPasswordModule from './recoverPasswordModule';
import profileModule from './profileModule';
import mainStore from './mainStore';

export default (pageId: string) => {
	switch (pageId) {
	case '/pages/staff/login/index':
		return mainStore({ login: loginModule });
	case '/pages/staff/password-recovery/first-step':
		return mainStore({ login: loginModule, recoverPassword: recoverPasswordModule });
	case '/pages/staff/password-recovery/second-step':
	case '/pages/staff/password-recovery/third-step':
		return mainStore({ recoverPassword: recoverPasswordModule });
	case '/pages/dashboard/profile/index':
		return mainStore({ profileModule });
	default:
		return mainStore({});
	}
};
