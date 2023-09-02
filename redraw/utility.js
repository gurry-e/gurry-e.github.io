/**
 * Remove a given element from an array
 * @param {Array<T>} arr array
 * @param {T} e element to be removed
 */
function removeFromArray(arr, e) {
    arr.splice(arr.indexOf(e), 1)
}

function avg(arr) {
  var total = 0;
  for (var i in arr) {
    total += i;
  }
  return total / arr.length;
}

function round(num, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}

function roundPct(num, places) {
  return round(num * 100, places)
}

function ned(type) {
    return document.createElement(type)
}

function showModal(modalContent) {
    document.body.appendChild(modalContent.parentElement)
    modalContent.parentElement.style.display = 'block'
}
