import "./index.scss"
import { useRef, useState, useEffect } from 'react';
import useStore from "../../state";
import { drawCanvas, getColor, dataToImage } from "../../util/image";
export default ({ }) => {
    const { setSelectPickFlag,setSelectDialogPickRect,selectDialogPickFlag, setPickPosition, pickImage, selectPickFlag, setPreviewImage, setSelectPickRect, setPickPoint, switchPressX, switchPressC, switchPressR, switchPressH, switchPressE, switchPressU, switchPressI, switchPressY, switchPressJ } = useStore();
    const isSelected = useRef(false);
    const isDialogSelected = useRef(false);
    const isZ = useRef(false);
    const isDrag = useRef(false);
    const mainRef = useRef(null);
    const glsRef = useRef(null);
    const cvDesRef = useRef(null);
    const cvNavRef = useRef(null);
    const cvGlsRef = useRef(null);
    const glsPosRef = useRef(null);
    const glsHexRef = useRef(null);
    const glsHexRef2 = useRef(null);
    const lstClientX = useRef(0);
    const lstClientY = useRef(0);


    const setPickPointEvent = (keyCode) => {
        let index = ((isZ.current ? (keyCode - 48) + 10 : (keyCode - 48))) - 1;
        let pos = glsPosRef.current.innerHTML.split(",");
        let x = Number(pos[0]);
        let y = Number(pos[1]);
        let color = glsHexRef.current.innerHTML;
        setPickPoint(index, { x, y, color, checked: true });
    }


    //发送更新选区事件
    const pushUpdateSelectEvent = async (x1, y1, x2, y2) => {
        [x1, x2] = x1 > x2 ? [x2, x1] : [x1, x2];
        [y1, y2] = y1 > y2 ? [y2, y1] : [y1, y2];
        if(isDialogSelected.current){
            setSelectDialogPickRect({x1, y1, x2, y2})
        }else{
            let image = getImage(x1, y1, x2, y2);
            setSelectPickRect({ x1, y1, x2, y2 });
            setPreviewImage(image);
        }
        setSelectPickFlag(false);
    }

    //Z键抬起事件
    const bindKeyUpEvent = (e) => {
        if (e.code == "KeyZ") {
            isZ.current = false;
        }
    }
    //绑定发送采集点的信息
    const bindKeyDownEvent = (e) => {
        if (isDrag.current) {
            return true;
        }
        if (e.code == "KeyZ") {
            isZ.current = true;
            return true;
        }
        if (e.code == "KeyH") {
            switchPressH();
            return true;
        }
        if (e.code == "KeyE") {
            switchPressE();
            return true;
        }

        if (e.code == "KeyU") {
            switchPressU();
            return true;
        }
        if (e.code == "KeyI") {
            switchPressI();
            return true;
        }
        if (e.code == "KeyY") {
            switchPressY();
            return true;
        }
        if (e.code == "KeyJ") {
            switchPressJ();
            return true;
        }

        if (e.code == "KeyR") {
            switchPressR();
            return true;
        }
        if (e.code == "KeyC") {
            switchPressC();
            return true;
        }
        if (e.code == "KeyW") {
            const event = new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                clientX: lstClientX.current, // 鼠标的 X 坐标
                clientY: lstClientY.current - 1, // 鼠标的 Y 坐标
                view: window
            });
            cvDesRef.current.dispatchEvent(event);
            return true;
        }
        if (e.code == "KeyA") {
            const event = new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                clientX: lstClientX.current - 1, // 鼠标的 X 坐标
                clientY: lstClientY.current, // 鼠标的 Y 坐标
                view: window
            });
            cvDesRef.current.dispatchEvent(event);
            return true;
        }
        if (e.code == "KeyS") {
            const event = new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                clientX: lstClientX.current, // 鼠标的 X 坐标
                clientY: lstClientY.current + 1, // 鼠标的 Y 坐标
                view: window
            });
            cvDesRef.current.dispatchEvent(event);
            return true;
        }
        if (e.code == "KeyD") {
            const event = new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                clientX: lstClientX.current + 1, // 鼠标的 X 坐标
                clientY: lstClientY.current, // 鼠标的 Y 坐标
                view: window
            });
            cvDesRef.current.dispatchEvent(event);
            return true;
        }

        if (e.code == "KeyX") {
            switchPressX();
            return true;
        }
        const keyCode = e.keyCode == 48 ? 58 : e.keyCode;
        if (keyCode >= 49 && keyCode <= 58) {
            setPickPointEvent(keyCode);
        }
    }

    //设置展示图片
    const showImage = (image) => {
        return new Promise((resolve) => {
            let img = image;
            drawCanvas(cvDesRef.current, img);
            drawCanvas(cvNavRef.current, img);
            resolve(true);
        });
    }

    //获取图片源数据
    const getImage = (x1, y1, x2, y2) => {
        let ctx = cvNavRef.current.getContext("2d");
        let sx = x1;
        let sy = y1;
        let sw = x2 - x1;
        let sh = y2 - y1;
        return dataToImage(ctx.getImageData(sx, sy, sw, sh));
    }

    //画红色选区
    const drawPickRectImage = (x1, y1, x2, y2) => {
        const nav = cvNavRef.current;
        const des = cvDesRef.current;
        let ctx = des.getContext("2d");
        ctx.drawImage(nav, 0, 0, des.width, des.height, 0, 0, des.width, des.height);
        ctx.save();
        ctx.translate(0.5, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.strokeStyle = "red";
        if (x1 && y1 && x2 && y2) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
        ctx.restore();
    }

    //画放大镜内容
    const drawGlassImage = (mX, mY) => {
        let ctx = cvGlsRef.current.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 240, 240);
        ctx.drawImage(cvNavRef.current, mX - 20, mY - 20, 40, 40, -20, -20, 240, 240);
        let drawStartX = 100 - 1;
        let drawStartY = 100 - 1;
        let scalePlus = 7;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(drawStartX, drawStartY);
        ctx.lineTo(drawStartX, drawStartY + scalePlus);
        ctx.lineTo(drawStartX + scalePlus, drawStartY + scalePlus);
        ctx.lineTo(drawStartX + scalePlus, drawStartY);
        ctx.lineTo(drawStartX, drawStartY);
        ctx.stroke();
    }

    //设置放大镜信息
    const setGlassInfo = (mX, mY) => {
        drawGlassImage(mX, mY);
        const position = mX + "," + mY;
        glsPosRef.current.innerHTML = position;
        const { bgrHex, r, g, b } = getColor(cvNavRef.current, mX, mY);
        glsHexRef.current.innerHTML = bgrHex;
        glsHexRef2.current.style.backgroundColor = `rgb(${r},${g},${b})`;
    }

    //初始化拖拽事件
    useEffect(() => {
        const container = mainRef.current;
        let isPressMouse = false;
        let lastMouseX, lastMouseY;
        const handleMouseDown = (e) => {
            isDrag.current = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            isPressMouse = true;
            return true;
        }
        const handleMouseMove = (e) => {
            if (isSelected.current) {
                return true;
            }
            if (!isPressMouse) {
                return true;
            }
            let dx = lastMouseX - e.clientX;
            let dy = lastMouseY - e.clientY;
            container.scrollTop = container.scrollTop + dy;
            container.scrollLeft = container.scrollLeft + dx;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            return true;
        }

        const handleMouseUp = (e) => {
            isDrag.current = false;
            isPressMouse = false;
            return true;
        }

        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseup", handleMouseUp);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    //初始化画图事件
    useEffect(() => {
        const container = cvDesRef.current;
        let isPressMouse = false;
        let firstMouseX, firstMouseY;
        const handleMouseDown = (e) => {
            if (!isSelected.current) {
                return true;
            }
            isPressMouse = true;
            firstMouseX = e.offsetX;
            firstMouseY = e.offsetY;
            return true;
        }
        const handleMouseMove = (e) => {
            if (!isSelected.current) {
                return true;
            }
            if (!isPressMouse) {
                return true;
            }
            let moveMouseX = e.offsetX;
            let moveMouseY = e.offsetY;
            drawPickRectImage(firstMouseX, firstMouseY, moveMouseX, moveMouseY);
            return true;
        }

        const handleMouseUp = (e) => {
            if (!isSelected.current) {
                return true;
            }
            if (!isPressMouse) {
                return true;
            }
            isPressMouse = false;
            isSelected.current = false;
            let moveMouseX = e.offsetX;
            let moveMouseY = e.offsetY;
            moveMouseX = firstMouseX == moveMouseX ? moveMouseX + 1 : moveMouseX;
            moveMouseY = firstMouseY == moveMouseY ? moveMouseY + 1 : moveMouseY;
            drawPickRectImage(firstMouseX, firstMouseY, moveMouseX, moveMouseY);
            pushUpdateSelectEvent(firstMouseX, firstMouseY, moveMouseX, moveMouseY);
            return true;
        }
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseup", handleMouseUp);
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    //初始化Glass放大镜移动
    useEffect(() => {
        const container = cvDesRef.current;
        const glass = glsRef.current;
        const handleMouseMove = (e) => {
            mainRef.current?.focus();
            let pickSmallWidth = 200;
            let pickSmallHeight = 206;
            let positionX = e.offsetX;
            let positionY = e.offsetY;
            if ((positionX + pickSmallWidth) > container.width) {
                positionX = positionX - pickSmallWidth;
                positionX = positionX - 10;
            } else {
                positionX = positionX + 10;
            }
            if ((positionY + pickSmallHeight) > container.height) {
                positionY = positionY - pickSmallHeight;
                positionY = positionY - 20;
            } else {
                positionY = positionY + 20;
            }
            glass.style.left = positionX + "px";
            glass.style.top = positionY + "px";
            return true;
        }
        const wrapHandleMouseMove = (e) => {
            let left = parseInt(glass.style.left.replace("px", ""));
            let top = parseInt(glass.style.top.replace("px", ""));
            handleMouseMove({
                offsetX: e.offsetX + left, offsetY: e.offsetY + top
            })
        }
        container.addEventListener("mousemove", handleMouseMove);
        glass.addEventListener("mousemove", wrapHandleMouseMove);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            glass.removeEventListener('mousemove', wrapHandleMouseMove);
        };
    }, []);

    //监听Glass信息回调
    useEffect(() => {
        const container = cvDesRef.current;
        let t;
        const handleMouseMove = (e) => {
            if (t) {
                clearTimeout(t);
                t = null;
            }
            t = setTimeout(() => {
                let moveX = e.offsetX;
                let moveY = e.offsetY;
                setGlassInfo(moveX, moveY);
                setPickPosition({ x: moveX, y: moveY })
            }, 10);
        }
        container.addEventListener("mousemove", handleMouseMove);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    //监听记录鼠标位置
    useEffect(() => {
        const container = cvDesRef.current;

        const handleMouseDown = (e) => {
            container.focus();
            return true;
        }
        const handleMouseMove = (e) => {
            lstClientX.current = e.clientX;
            lstClientY.current = e.clientY;
        }
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);

    //监听选取状态
    useEffect(() => {
        isSelected.current = selectPickFlag;
    }, [selectPickFlag]);

    //监听选取状态
    useEffect(() => {
        isDialogSelected.current = selectDialogPickFlag;
    }, [selectDialogPickFlag]);

    //监听选区事件
    useEffect(() => {
        if (pickImage) {
            showImage(pickImage);
        }
    }, [pickImage]);



    return (
        <>
            <div tabIndex={0} onKeyDown={bindKeyDownEvent} onKeyUp={bindKeyUpEvent} className="canvas" ref={mainRef} style={{ position: "relative", overflowY: "scroll" }}>
                <div style={{ paddingBottom: "50px" }}>
                    <canvas ref={cvDesRef} style={{ border: "0px", padding: "0px", margin: "0px" }}></canvas>
                    <canvas ref={cvNavRef} style={{ display: "none" }}></canvas>
                </div>
                <div className="Glass" ref={glsRef}>
                    <canvas ref={cvGlsRef} width="200px" height="200px"></canvas>
                    <p className="pickCanvasSmallLine">
                        <span className="lineItem">位置:</span>
                        <span className="lineItem" ref={glsPosRef}>720,1280</span>
                        <span className="lineItem" > 进制:#</span>
                        <span className="lineItem" ref={glsHexRef}></span>
                        <span className="lineItem lineItemRight" ref={glsHexRef2}></span>
                    </p>
                </div>
            </div>

        </>
    )
}