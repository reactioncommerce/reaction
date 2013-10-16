getObjects = function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
};


//
//
// returns a random item from any array,
// if you pass a non-falsey argument,
// it removes the item from the array.
// ex: alert(colors.getRandom());
// where colors in an array.
//
//
Array.prototype.getRandom = function(cut){
    var i= Math.floor(Math.random()*this.length);
    if(cut && i in this){
        return this.splice(i, 1)[0];
    }
    return this[i];
}