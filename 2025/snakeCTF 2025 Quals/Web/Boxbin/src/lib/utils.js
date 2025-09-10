const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

export function merge(target, source) {
    for (const key in source) {
        if (isObject(target[key]) && isObject(source[key])) {
            merge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

