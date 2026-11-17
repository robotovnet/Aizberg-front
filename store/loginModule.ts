
import  { ActionContext, createStore, Store } from 'vuex'
import { InputType } from './InputType'

export interface LoginState {
  loginType: InputType
}

export default {
    namespaced: true,
    state () {
      return {
          loginType: InputType.ByEmail
      }
    },
    mutations: {
       setLoginType(state: LoginState, type: InputType) {
          state.loginType = type
       }
    },
    actions: {
      initStore(context: ActionContext<LoginState, LoginState>) {
         const key = localStorage.getItem('login_type')
         if(key) {
           const type = InputType[key as keyof typeof InputType]
           context.commit('setLoginType', type)
         }
      },
      setLoginType(context: ActionContext<LoginState, LoginState>, type: InputType) {
        const key = InputType[type]
        localStorage.setItem('login_type', key)
        context.commit('setLoginType', type)
      }
    }
  }
