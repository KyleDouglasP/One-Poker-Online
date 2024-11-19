
export function cardToAsset(card){
    if( !(typeof card === "string") ) return null;
    return require('../assets/'+card+'.png');
}