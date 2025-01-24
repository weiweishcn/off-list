const isUndefined = (val) => {
    return typeof val === 'undefined';
};

const objPropertiesDefined = (obj, props) => {
    for(const p of props) {
        if(isUndefined(obj[p]))
            return false;
    }

    return true;
}

module.exports = { objPropertiesDefined };