import { useRef, useEffect, useState } from 'react';
import useStore from "../../state";
import toastr from 'toastr';
import { api } from "../../api";
import { sqrt, iteratorAllImageData } from "./Images";
import { dataToImage, imageToData, toRGB } from '../../util/image';
import { currentDate } from '../../util/date';
import { parsePoints } from '../../util/point';
import { imageToB64 } from "../../util/image";
export default ({ }) => {
    const { setPickPoint, pressY, addOcr2Visiable, setAddOcr2Visiable, dirAndSim, setPreviewImage, selectDialogPickRect, setSelectDialogPickRect, selectPickRect, setSelectDialogPickFlag, previewImage, pressX, pressC, pickPointList, setAddBitVisiable, addBitVisiable, pressU, pickPosition } = useStore();
    const ref = useRef(null);
    const [x, setX] = useState(false);
    const [c, setC] = useState(false);
    const [name, setName] = useState('');
    const [fbl, setFbl] = useState(720);
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);
    const [rx, setRx] = useState(0);
    const [ry, setRy] = useState(0);
    const [shift, setShift] = useState("151515");
    const [scale, setScale] = useState(2);
    const [tolerance, setTolerance] = useState(0.9);
    const [dist, setDist] = useState(3);
    const [scale2, setScale2] = useState(4);
    const initImage = useRef(null);
    const initRect = useRef(null);
    const initPoint = useRef(null);

    useEffect(() => {
        if (selectDialogPickRect && addOcr2Visiable) {
            pushPreviewImageEvent();
        }
    }, [selectDialogPickRect, scale,scale2]);


    useEffect(() => {
        if (addOcr2Visiable) {
            setName('');
            setDx(0);
            setDy(0);
            setRx(0);
            setRy(0);
            setX(false);
            setC(false);
            setSelectDialogPickFlag(true);
            initImage.current = previewImage;
            initRect.current = selectPickRect;
            initPoint.current = getFirstPoint();
            setSelectDialogPickRect({ ...selectPickRect });
        } else {
            setSelectDialogPickFlag(false);
            setPreviewImage(initImage.current);
        }
    }, [addOcr2Visiable]);


    useEffect(() => {
        if (pressY) {
            if (!getFirstPoint()) {
                toastr.error("请选择一个点");
                return;
            }
            setAddOcr2Visiable(true)
        }
    }, [pressY]);

    useEffect(() => {
        if (x) {
            let first = getFirstPoint();
            if (first) {
                setDx(pickPosition.x - first.x);
                setDy(pickPosition.x - first.x);
            }
        }
        if (c) {
            let first = getFirstPoint();
            if (first) {
                setRx(Math.abs(pickPosition.x - (first.x + (parseInt(dx)))));
                setRy(Math.abs(pickPosition.y - (first.y + (parseInt(dy)))));
            }
        }
    }, [pickPosition]);

    const checkValue = () => {
        let res = false;
        ref.current.querySelectorAll("input,select").forEach(e => {
            if (!e.value) {
                res = true;
                return;
            }
        });
        return res;
    }

    const getFirstPoint = () => {
        return pickPointList.filter(l => l.checked)[0]
    }



    useEffect(() => {
        if (x) {
            let first = getFirstPoint();
            if (first) {
                setDx(pickPosition.x - first.x);
                setDy(pickPosition.x - first.x);
            }
        }
        if (c) {
            let first = getFirstPoint();
            if (first) {
                setRx(Math.abs(pickPosition.x - (first.x + (parseInt(dx)))));
                setRy(Math.abs(pickPosition.y - (first.y + (parseInt(dy)))));
            }
        }
    }, [pickPosition]);

    const drawPreviewImage = async () => {
        let firstX = 0;
        let firstY = 0;
        let minX = 99999;
        let maxX = -99999;
        let minY = 99999;
        let maxY = -99999;

        

        let fRgb = toRGB(initPoint.current.color);
        let fShift = toRGB(initPoint.current.shift);
        let image = imageToData(initImage.current);
        let lst = selectDialogPickRect;
        let rX1 = lst.x1 - initRect.current.x1;
        let rY1 = lst.y1 - initRect.current.y1;
        let rX2 = lst.x2 - initRect.current.x1;
        let rY2 = lst.y2 - initRect.current.y1;
        let num = -1;
        let num2 = -1;
        let inAllPoint = [];
        let outPoint = [];
        iteratorAllImageData(image, (x, y, getRgb, setRgb) => {
            if ((x >= rX1 && x <= rX2 && y >= rY1 && y <= rY2)) {
                let imageRgb = getRgb();
                if (Math.abs(imageRgb.r - fRgb.r) <= fShift.r &&
                    Math.abs(imageRgb.g - fRgb.g) <= fShift.g &&
                    Math.abs(imageRgb.b - fRgb.b) <= fShift.b) {
                    inAllPoint.push({ x, y });
                    num = num + 1;
                    if (num % scale == 0) {
                        if (!firstX) {
                            firstX = x;
                            firstY = y;
                        }
                        if (minX > x) {
                            minX = x;
                        }
                        if (minY > y) {
                            minY = y;
                        }
                        if (maxX < x) {
                            maxX = x;
                        }
                        if (maxY < y) {
                            maxY = y;
                        }
                        setRgb();
                    }
                } else {
                    num2 = num2 + 1;
                    if (num2 % scale2 == 0) {
                        outPoint.push({
                            x, y, setRgb
                        });
                    }
                }
            }
        });

        outPoint = outPoint.filter(outP => {
            for (let item of inAllPoint) {
                if (sqrt(item.x, item.y, outP.x, outP.y) <= dist) {
                    return false;
                }
            }
            return true;
        });
        outPoint.forEach(value => value.setRgb(1));

        let x1 = minX + initRect.current.x1;
        let y1 = minY + initRect.current.y1;
        let x2 = maxX + initRect.current.x1;
        let y2 = maxY + initRect.current.y1;
        firstX = firstX + initRect.current.x1;
        firstY = firstY + initRect.current.y1;
        //第一个点的xy值 和距离宽高
        return [image, { firstX, firstY, x1, y1, x2, y2 }];
    }

    const pushPreviewImageEvent = async () => {
        let [previewImage, { firstX, firstY, x1, y1, x2, y2 }] = await drawPreviewImage();
        let midX = Math.floor((x1 + x2) / 2);
        let midY = Math.floor((y1 + y2) / 2);
        let dx = midX - firstX;
        let dy = midY - firstY;
        let rx = Math.floor((Math.abs(x2 - x1) / 2) * 0.95);
        let ry = Math.floor((Math.abs(y2 - y1) / 2) * 0.95);
        setDx(dx);
        setDy(dy);
        setRx(rx);
        setRy(ry);
        setPickPoint(0, {
            checked: true,
            x: firstX,
            y: firstY
        });
        let img = await dataToImage(previewImage);
        setPreviewImage(img);
    }

    const buildPointAndExList = () => {
        let pList = [];
        let pExList = [];
        let fRgbHex=initPoint.current.color;
        let fRgb = toRGB(initPoint.current.color);
        let fShift = toRGB(initPoint.current.shift);
        let image = imageToData(initImage.current);
        let lst = selectDialogPickRect;
        let rX1 = lst.x1 - initRect.current.x1;
        let rY1 = lst.y1 - initRect.current.y1;
        let rX2 = lst.x2 - initRect.current.x1;
        let rY2 = lst.y2 - initRect.current.y1;
        let inAllPoint = [];
        let outPoint = [];
        let num = -1;
        let num2 = -1;

        iteratorAllImageData(image, (x, y, getRgb, setRgb) => {
            if ((x >= rX1 && x <= rX2 && y >= rY1 && y <= rY2)) {
                let imageRgb = getRgb();
                if (Math.abs(imageRgb.r - fRgb.r) <= fShift.r &&
                    Math.abs(imageRgb.g - fRgb.g) <= fShift.g &&
                    Math.abs(imageRgb.b - fRgb.b) <= fShift.b) {
                    inAllPoint.push({ x, y });
                    num = num + 1;
                    if (num % scale == 0) {
                        let color = imageRgb.bgrHex;
                        pList.push({ x: initRect.current.x1 + x, y: initRect.current.y1 + y, color, shift });
                    }
                } else {
                    num2 = num2 + 1;
                    if (num2 % scale2 == 0) {
                        outPoint.push({
                            x, y, setRgb
                        });
                    }
                }
            }
        });

        outPoint = outPoint.filter(outP => {
            for (let item of inAllPoint) {
                if (sqrt(item.x, item.y, outP.x, outP.y) <= dist) {
                    return false;
                }
            }
            return true;
        });
        outPoint.forEach(({ x, y }) => {
            pExList.push({
                x: initRect.current.x1 + x,
                y: initRect.current.y1 + y,
                color: fRgbHex,
                shift: shift
            })
        });
        return { points:pList, exPoints:pExList }
    }

   


    const commitEvent = async() => {
        if (checkValue()) {
            toastr.error("请填写完整");
            return;
        }
        if(initPoint.current==null){
            toastr.error("请选择一个点");
            return;
        }
        //points:pList, exPoints:pExList
        let previed = imageToB64(previewImage);
        let {points,exPoints} = buildPointAndExList();
        let [color,feature] = parsePoints(points);
        let [exColor,exFeature] = parsePoints(exPoints);
        let dirSim = dirAndSim;
        let rect = initRect.current;
        let val = {
            color,feature,
            exColor,exFeature,
            ...rect,
            ...dirSim,
            tolerance,
            name,
            fbl,
            dx,
            dy,
            rx,
            ry,
            shift,
            scale,
            previed,
            type: "mul",
            date: currentDate()
        }
        await api.addPoint(val);
        toastr.info("复杂字点增加成功!");
        setAddOcr2Visiable(false);
    }



    return <div className="innerAddPoint" ref={ref}>
        <p >
            <span>名称P:</span>
            <span><input style={{ width: "155px" }} value={name} onChange={(e) => setName(e.target.value)} /></span>
            <span>分辨率:</span>
            <select attr="fbl" className="addPointFbl" value={fbl} onChange={(e) => setFbl(e.target.value)}>
                <option value="720">720</option>
                <option value="1080">1080</option>
            </select>
        </p>
        <p >
            <span>相对X:</span>
            <span><input style={{ width: "40px" }} defaultValue={"0"} value={dx} onChange={(e) => setDx(e.target.value)} /></span>
            <span>相对Y:</span>
            <span><input style={{ width: "40px" }} defaultValue={"0"} value={dy} onChange={(e) => setDy(e.target.value)} /></span>
            <span><input type="checkbox" value={x} onChange={(e) => setX(e.target.checked)} /></span>
            <span >偏色值:</span>
            <span><input style={{ width: "47px" }} value={shift} onChange={(e) => setShift(e.target.value)} /></span>
        </p>
        <p>
            <span>随机X:</span>
            <span><input style={{ width: "40px" }} value={rx} onChange={(e) => setRx(e.target.value)} /></span>
            <span>随机Y:</span>
            <span><input style={{ width: "40px" }} value={ry} onChange={(e) => setRy(e.target.value)} /></span>
            <span><input type="checkbox" checked={c} onChange={(e) => setC(e.target.checked)} /></span>
            <span>间隔数:</span>
            <span><input style={{ width: "47px" }} value={scale} onChange={(e) => setScale(e.target.value)} /></span>
        </p>
        <p >
            <span>置信度:</span>
            <span><input style={{ width: "35px" }} value={tolerance} onChange={(e) => setTolerance(e.target.value)} /></span>
            <span>&nbsp;&nbsp;距离:</span>
            <span><input style={{ width: "40px" }} value={dist} onChange={(e) => setDist(e.target.value)} /></span>
            <span>&nbsp;&nbsp;&nbsp;间隔数2:</span>
            <span><input style={{ width: "47px" }} value={scale2} onChange={(e) => setScale2(e.target.value)} /></span>
        </p>
        <p style={{ textAlign: "center" }}>
            <button style={{ width: "100%", padding: "3px" }} onClick={commitEvent}>确定</button>
        </p>
    </div>
}