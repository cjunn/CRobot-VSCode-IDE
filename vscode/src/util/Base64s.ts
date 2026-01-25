const uInt8ToBase64 = (array: Uint8Array): string => {
    let binary = "";
    for (let len = array.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(array[i]);
    }
    return btoa(binary).replace(/=/g, "");
}

const base64ToUInt8 = (base64String: string): Uint8Array => {
    let padding = '='.repeat((4 - base64String.length % 4) % 4);
    let base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    let rawData = atob(base64);
    let outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export {
    uInt8ToBase64,
    base64ToUInt8
}