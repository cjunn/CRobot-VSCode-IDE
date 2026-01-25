import "./index.scss"
import useStore from "../../state";
import { useRef, useState, useEffect } from 'react';

let __previewWidth = 300;
let __previewHeight = 190;


const calPreviewWidthHeight = (width, height) => {
    if (__previewWidth >= width && __previewHeight >= height) {
        return {
            width: width,
            height: height
        };
    }
    let scale = (height / width);
    let targetHeight = __previewWidth * scale;
    if (targetHeight <= __previewHeight) {
        return {
            width: __previewWidth,
            height: targetHeight
        }
    }
    let targetWidth = __previewHeight / scale;
    if (targetWidth <= __previewWidth) {
        return {
            width: targetWidth,
            height: __previewHeight
        }
    }
}

export default ({ }) => {
    const { previewImage } = useStore();

    const ref = useRef(null);

    const drawPreviewImage = (image) => {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        let { width, height } = calPreviewWidthHeight(image.width, image.height);
        let preCtx = ref.current.getContext("2d");
        ref.current.width = width;
        ref.current.height = height;
        ref.current.style.width = width + "px";
        ref.current.style.height = height + "px";
        preCtx.clearRect(0, 0, __previewWidth, __previewHeight);
        preCtx.drawImage(canvas, 0, 0, image.width, image.height, 0, 0, width, height);
    }



    useEffect(() => {
        if(previewImage&&previewImage.width>0){
            console.log(previewImage.src)
            drawPreviewImage(previewImage);
        }
    }, [previewImage]);

    return (
        <>
            <div className="thumbnail">
                <canvas width="300px" height="190px" ref={ref}></canvas>
            </div>
        </>
    )
}