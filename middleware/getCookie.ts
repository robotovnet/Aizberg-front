export default function(doc: Document, cname: string) {
    if(!doc)
        return ''
    let name = cname + '='
    let decodedCookie = decodeURIComponent(doc.cookie)
    let ca = decodedCookie.split(';')
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }