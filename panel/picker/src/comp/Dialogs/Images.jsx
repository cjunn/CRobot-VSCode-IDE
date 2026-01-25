const setRedColor = (data,ind) => {
    try {
        data[ind] = 255;
        data[ind + 1] = 0;
        data[ind + 2] = 0;
    } catch {

    }
}

const getRgb = (data, ind) => {
    let r = data[ind];
    let g = data[ind + 1];
    let b = data[ind + 2];
    let r2 = r.toString(16);
    r2 = r2.length < 2 ? "0" + r2 : r2;
    let g2 = g.toString(16);
    g2 = g2.length < 2 ? "0" + g2 : g2;
    let b2 = b.toString(16);
    b2 = b2.length < 2 ? "0" + b2 : b2;
    return {
        r: r,
        g: g,
        b: b,
        bgrHex: (b2 + g2 + r2).toUpperCase()
    }
}

const setRgb = (data, ind, green) => {
    try {
        if (green) {
            data[ind] = 0;
            data[ind + 1] = 255;
            data[ind + 2] = 0;
        } else {
            data[ind] = 255;
            data[ind + 1] = 0;
            data[ind + 2] = 0;
        }
    } catch {

    }

}


const iteratorAllImageData = (image, fn) => {
    let width = image.width - 2;
    let height = image.height - 2;
    let data = image.data;
    for (let y = 1; y < height; y++) {
        for (let x = 1; x < width; x++) {
            ((x, y, data, ind) => {
                let _getRgb = ()=>getRgb(data,ind)
                let _setRgb = (green)=>setRgb(data, ind, green);
                fn(x, y, _getRgb, _setRgb);
            })(x, y, data, (y * image.width + x) * 4);
        }
    }
}

const iteratorImageData = (image, scale, fn) => {
    let width = image.width - 2;
    let height = image.height - 2;
    let nexWidth = Math.floor(width * scale);
    let nexHeight = Math.floor(height * scale);
    let nexUnit = nexWidth > nexHeight ? nexWidth : nexHeight;
    nexUnit = nexUnit <= 0 ? 1 : nexUnit;
    for (let y = 1; y < height; y = y + nexUnit) {
        for (let x = 1; x < width; x = x + nexUnit) {
            let ind = (y * image.width + x) * 4;
            let getInd = function (_x, _y) {
                return (_y * image.width + _x) * 4;
            }
            fn(x, y, image.data, ind, x == 1 && y == 1, getInd);
        }
    }
}


const data2BgrHex = (data, ind) => {
    let r = data[ind];
    let g = data[ind + 1];
    let b = data[ind + 2];
    r = r.toString(16);
    r = r.length < 2 ? "0" + r : r;
    g = g.toString(16);
    g = g.length < 2 ? "0" + g : g;
    b = b.toString(16);
    b = b.length < 2 ? "0" + b : b;
    let color = (b + g + r).toUpperCase();
    return color;
}

const sqrt = (x1, y1, x2, y2) => {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}


export {
    iteratorImageData,
    setRedColor,
    data2BgrHex,
    iteratorAllImageData,
    sqrt
}