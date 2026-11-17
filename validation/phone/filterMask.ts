
import ci from  './clearInput'

const phoneLength = 12
export {
    phoneLength
}

export default function(value: string, evnt: {target: {value?: string}, which?: number, keyCode: number, kc: number, 
    preventDefault: () => void}, onChanged: (newValue: string) => void) {
    const keyCode = evnt.kc || evnt.which || evnt.keyCode
    const clearInput = ci(value)
    if(clearInput.length == phoneLength && keyCode != 8)
        evnt.preventDefault()
    else if([5, 8, 10].includes(clearInput.length) && keyCode == 8) 
        onChanged(value.slice(0, -2) + value.charAt(value.length-1))
    else if([38, 39, 40, 37].includes(keyCode) || (value == '+' && keyCode == 8))
        evnt.preventDefault()
    else if(keyCode != 8 && (keyCode < 48 || keyCode > 57)) 
        evnt.preventDefault()
    else if(value == '+') {
        if(keyCode == 56 || keyCode == 55) {
            evnt.preventDefault()
            onChanged(value + '7')
        } else
            onChanged('+7' + value.substring(1))
    }
}