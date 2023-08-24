/**
 * Remove a given element from an array
 * @param {Array<T>} arr array
 * @param {T} e element to be removed
 */
function removeFromArray(arr, e) {
    arr.splice(arr.indexOf(e), 1)
}

function ned(type) {
    return document.createElement(type)
}
