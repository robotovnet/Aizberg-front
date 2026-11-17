
import ci from  './clearInput'

export default function(value: string, onChanged: (newValue: string) => void) {
    const clearInput = ci(value)
    if(value.length > 1 && !value.startsWith('+7'))
        onChanged((value.startsWith('7')) ? `+${ci(value).replace(/\+/g, "")}`: (value.startsWith('8')) ? `+7${ci(value.substring(1)).replace(/\+/g, "")}` : `+7${ci(value).replace(/\+/g, "")}`)
    if(clearInput.length == 5)
        onChanged(`+7 (${clearInput.substring(2, 5)})`)
    else if(clearInput.length == 8)
        onChanged(`+7 (${clearInput.substring(2, 5)}) ${clearInput.substring(5, 8)}-`)
    else if(clearInput.length == 10)
        onChanged(`+7 (${clearInput.substring(2, 5)}) ${clearInput.substring(5, 8)}-${clearInput.substring(8, 10)}-`)
    else if(clearInput.length == 12)
        onChanged(`+7 (${clearInput.substring(2, 5)}) ${clearInput.substring(5, 8)}-${clearInput.substring(8, 10)}-${clearInput.substring(10, 12)}`)
}