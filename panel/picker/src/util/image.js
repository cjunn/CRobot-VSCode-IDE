const b64ToImage = async (b64) => {
    let img = new Image();
    img.src = "data:image/png;base64," + b64;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
    })
}

const imageToB64=(img) => {
    if(!img){
        return;
    }
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    let data = canvas.toDataURL('image/png');
    let ret = data.substring("data:image/png;base64,".length);
    return ret;
}

const drawCanvas = (canvas, img) => {
    let ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.width = img.width + "px";
        canvas.style.height = img.height + "px";
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
}

const dataToImage = (data) => {
    let canvas, context;
    canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);

    let dataUrl = canvas.toDataURL(); // 获取图片的dataURL
    let img = new Image(); // 创建一个Image对象
    img.src = dataUrl; // 设置Image对象的src属性为dataURL

    return img;
}

const imageToData = (img) => {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canvas.getContext('2d').getImageData(0, 0, img.width, img.height);
}

const imageSave = (img) => {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = "untitled.png"; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const getColor = (canvas, mX, mY) => {
    let ctx = canvas.getContext("2d");
    let rgbV = ctx.getImageData(mX, mY, 1, 1).data;
    let r = rgbV[0].toString(16);
    r = r.length < 2 ? "0" + r : r;
    let g = rgbV[1].toString(16);
    g = g.length < 2 ? "0" + g : g;
    let b = rgbV[2].toString(16);
    b = b.length < 2 ? "0" + b : b;
    let obj = {
        bgrHex: (b + g + r).toUpperCase(),
        r: rgbV[0],
        g: rgbV[1],
        b: rgbV[2]
    };
    return obj;
}

const toRGB = (color) => {
    if (!color || color.length < 6) {
        return { r: 0, g: 0, b: 0 };
    }
    let b = color.substring(0, 2);
    b = Number("0x" + b);
    let g = color.substring(2, 4);
    g = Number("0x" + g);
    let r = color.substring(4, 6);
    r = Number("0x" + r);
    return {
        r, g, b
    }
}

export {
    b64ToImage,
    imageSave,
    getColor,
    drawCanvas,
    dataToImage,
    imageToB64,
    imageToData,
    toRGB
}