export default function (phone: string) {
    if (phone)
        return phone.replace(/[ )(-]/g, "")
    else
        return ''
}