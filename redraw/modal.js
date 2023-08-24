function createModal() {
    var modal = ned("div")
    modal.className = "modal"
    var modal_content = modal.appendChild(ned("div"))
    modal_content.className = "modal-content"
    
    return modal
}

function ned(type) {
    return document.createElement(type)
}