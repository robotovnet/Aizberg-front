<template>
  <input
      tabindex="1"
      :disabled="initializing"
      @paste="onPaste"
      v-on:focus="onFocus"
      v-on:click="onFocus"
      v-on:blur="onBlur"
      v-model="inputData"
      v-on:keydown="filterInputKeys"
      ref="inpt"
      :type="inputType"
      class="auth-form__input input"
      :class="clsErr"
      :placeholder="inputPlaceHolder"
  >
  <span class="auth-form__error" v-html="errMsg"/>
</template>

<script lang="ts">
import {computed, nextTick, onMounted, watch} from '@vue/runtime-core'
import {ref} from 'vue'
import {InputType} from '../../store/InputType'
import clearInput from '../../validation/phone/clearInput'
import {useI18n} from 'vue-i18n'
import sleep from '../../utils/sleep'
import phoneMask from '../../validation/phone/phoneMask'
import IMask from 'imask'
import getValidator from '../../validation/getValidator'

export default {
  props: {
    text: {
      type: String,
      required: true
    },
    inputType: {
      type: Number,
      required: true
    },
    phoneMask: {
      type: String,
      required: true
    },
    validation: {
      type: Object,
      required: true
    },
    errMsg: {
      type: String,
      required: true
    },
    onEnter: {
      type: Function,
      required: true
    }
  },
  setup(props, {emit}) {

    const localization = useI18n()
    const inputData = ref(props.text)
    const errMsg = ref(props.errMsg || '&nbsp;')
    const inpt = ref()
    const initializing = ref(true)
    let defaultMask = true
    let active = false

    let inputEmail = ''
    let inputPhone = ''

    const filterInputKeys = (evnt: any) => {
      errMsg.value = '&nbsp;'
      if (!defaultMask)
        return
      const kc = (evnt.which || evnt.keyCode)
      const keyCode = (kc == 229) ? 8 : kc
      if (keyCode == 9)
        return
      evnt.kc = keyCode
      if (keyCode == 13)
        props.onEnter!()
      else if (props.inputType! == InputType.ByPhone)
        phoneMask.filterMask!(inputData.value, evnt, (newValue: string) => {
          inputData.value = newValue
        })
      else if (keyCode == 32)
        evnt.preventDefault()
    }

    watch(inputData, () => {
      if (!defaultMask)
        return
      if (props.inputType! == InputType.ByPhone) {
        if (active && inputData.value == '')
          inputData.value = '+'
        else if (inputData.value.endsWith('. '))
          inputData.value = inputData.value.slice(0, -2)
        else
          phoneMask.watchMask(inputData.value, (newValue: string) => {
            inputData.value = newValue
          })
      }
      emit('update:text', inputData.value)
    })

    watch(errMsg, () => emit('update:errMsg', errMsg.value))

    onMounted(() => {
      inpt.value.addEventListener('textInput', (evnt: any) => {
        evnt.keyCode = evnt.data.charCodeAt(0)
        filterInputKeys(evnt)
      })
      initializing.value = false
    })

    watch(() => props.phoneMask, () => {
      if (!props.phoneMask)
        return
      defaultMask = (props.phoneMask.replace(/ /g, "").startsWith("+{7}"))
      if (!defaultMask) {
        const maskOptions = {
          mask: props.phoneMask,
        }
        IMask(inpt.value, maskOptions)
      }
    })

    watch(() => props.text, () => {
      inputData.value = props.text
    })

    watch(() => props.errMsg, () => {
      errMsg.value = props.errMsg
    })

    watch(() => props.inputType, () => {
      switch (props.inputType) {
        case InputType.ByEmail:
          inputPhone = inputData.value
          inputData.value = inputEmail
          errMsg.value = ''
          nextTick(() => errMsg.value = '&nbsp;')
          break
        case InputType.ByPhone:
          inputEmail = inputData.value
          inputData.value = inputPhone
          errMsg.value = ''
          nextTick(() => errMsg.value = '&nbsp;')
          break
      }
    })


    return {
      initializing,
      inpt,
      errMsg,
      inputData,
      clsErr: computed(() => (errMsg.value !== '&nbsp;') ? 'input--error' : ''),
      onFocus: () => {
        if (!defaultMask)
          return
        active = true
        if (props.inputType! == InputType.ByPhone) {
          if (inputData.value == '')
            inputData.value = '+'
          else {
            const temp = inputData.value
            inputData.value = ''
            nextTick(() => {
              inputData.value = temp
            })
          }
        }
      },
      onBlur: () => {
        active = false
        if (props.inputType! == InputType.ByPhone) {
          const phone = clearInput(inputData.value).substring(1)
          const validator = getValidator({phone}, props.validation)
          if (inputData.value == '+')
            inputData.value = ''
          else if (inputData.value != '' && validator?.fails())
            errMsg.value = validator?.errors?.first('phone')?.toString() || localization.t('text.invalid_phone')
        } else if (inputData.value != '') {
          const validator = getValidator({email: inputData.value}, props.validation)
          if (validator?.fails())
            errMsg.value = validator?.errors?.first('email')?.toString() || localization.t('text.invalid_email')
        }
      },
      onPaste: async () => {
        if (props.inputType! == InputType.ByPhone) {
          const previousValue = inputData.value
          await sleep(1)
          inputData.value = previousValue
        }
      },
      filterInputKeys,
      inputType: computed(() => {
        switch (props.inputType!) {
          case InputType.ByPhone:
            return 'tel'
          case InputType.ByEmail:
            return 'email'
        }
      }),
      inputPlaceHolder: computed(() => {
        switch (props.inputType!) {
          case InputType.ByPhone:
            return localization.t('text.phone_placeholder')
          case InputType.ByEmail:
            return localization.t('text.email_placeholder')
        }
      })
    }
  }
}
</script>
