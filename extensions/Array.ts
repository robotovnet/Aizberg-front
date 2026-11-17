interface Array<T> {
    sortDescendantByField(field: string)
    sortAscendantByField(field: string)
}

Array.prototype.sortDescendantByField = function(field: string) {
    this.sort((a, b) => (a[field] < b[field]) ? 1 : (a[field] > b[field]) ? -1 : 0)
}

Array.prototype.sortAscendantByField = function(field: string) {
    this.sort((a, b) => (a[field] > b[field]) ? 1 : (a[field] < b[field]) ? -1 : 0)
}