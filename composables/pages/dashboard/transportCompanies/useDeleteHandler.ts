import {ref, inject} from 'vue'
import toaster from "../../../../utils/toaster";
import {useI18n} from "vue-i18n"
import sleep from "../../../../utils/sleep";


export default function sortByCityOrTransportCompany(store, service) {
    const toast = inject('toast') as any
    const localization: any = useI18n()
    const itemId = ref()
    const itemName = ref()
    const marker = ref(true)
    const onDelete = async (id) => {
        store.commit('setLoading', true)
        const response = await service.remove(localization, id, errMsg => toaster.error(toast, errMsg))
        if (response.message === 'success')
            marker.value = !marker.value
        store.commit('setLoading', false)
    }

    const onConfirmDelete = async (id, name) => {
        itemName.value = name
        itemId.value = undefined
        await sleep(1)
        itemId.value = id
    }

    return {
        marker,
        itemId,
        itemName,
        onDelete,
        onConfirmDelete,
    }
}