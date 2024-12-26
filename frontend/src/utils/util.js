export function cardToAsset(card){
    if( !(typeof card === "string") ) return null;
    return require('../assets/'+card+'.png');
}

export function generateUUID() {
    // Test if browser supports crypto.randomUUID
    if (crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback to a UUID generation algorithm
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
