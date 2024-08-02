const Secret = "XhqJYmZwOjVX"
function getLocalStorageItem() {
    const item = localStorage.getItem(Secret);
    return item ? JSON.parse(item) : null;
}

function setLocalStorageItem( value) {
    localStorage.setItem(Secret, JSON.stringify(value));
}

// Function to delete localStorage item with given name
function deleteLocalStorageItem() {
    localStorage.removeItem(Secret);
}
export {
    getLocalStorageItem, setLocalStorageItem, deleteLocalStorageItem
}