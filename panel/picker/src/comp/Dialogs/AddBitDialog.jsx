import { useRef, useEffect, useState } from 'react';
import useStore from "../../state";
import toastr from 'toastr';
import { api } from "../../api";
import { data2BgrHex, data2ColorString, iteratorImageData, setRedColor } from "./Images";
import { dataToImage, imageToData } from '../../util/image';
import { currentDate } from '../../util/date';
import { parsePoints } from '../../util/point';
import { imageToB64 } from "../../util/image";
export default ({ }) => {
    const ref = useRef(null);
    const [x, setX] = useState(false);
    const [c, setC] = useState(false);
    const { dirAndSim, setPreviewImage, selectDialogPickRect, setSelectDialogPickRect, selectPickRect, setSelectDialogPickFlag, previewImage, pressX, pressC, pickPointList, setAddBitVisiable, addBitVisiable, pressU, pickPosition } = useStore();
    const [name, setName] = useState('');
    const [fbl, setFbl] = useState(720);
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);
    const [rx, setRx] = useState(0);
    const [ry, setRy] = useState(0);
    const [shift, setShift] = useState("151515");
    const [scale, setScale] = useState(0.05);
    const initImage = useRef(null);
    const initRect = useRef(null);

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


    const commitEvent = async () => {
        if (checkValue()) {
            toastr.error("请填写完整");
            return;
        }
        let points = buildPointList();
        let [color,feature] = parsePoints(points);
        let previed = imageToB64(previewImage);
        let dirSim = dirAndSim;
        let rect = initRect.current;
        let val = {
            ...rect,
            ...dirSim,
            name,
            fbl,
            dx,
            dy,
            rx,
            ry,
            shift,
            scale,
            color,
            feature,
            previed,
            type: "mul",
            date: currentDate()
        }
        await api.addPoint(val);
        toastr.info("图点增加成功!");
        setAddBitVisiable(false);
    }

    useEffect(() => {
        if (addBitVisiable) {
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
            setSelectDialogPickRect({ ...selectPickRect });
        } else {
            setSelectDialogPickFlag(false);
            setPreviewImage(initImage.current);
        }
    }, [addBitVisiable]);


    useEffect(() => {
        if (selectDialogPickRect&&addBitVisiable) {
            pushPreviewImageEvent();
        }
    }, [selectDialogPickRect, scale]);

    useEffect(() => {
        if (pressX) {
            setX(!x);
        }
    }, [pressX]);


    useEffect(() => {
        if (pressC) {
            setC(!c);
        }
    }, [pressC]);

    useEffect(() => {
        if (pressU) {
            if (!getFirstPoint()) {
                toastr.error("请选择一个点");
                return;
            }
            setAddBitVisiable(true)
        }
    }, [pressU]);

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
        let scaleVal = parseFloat(scale);
        let image = imageToData(initImage.current);
        let lst = selectDialogPickRect;
        let iRect = initRect.current;
        let rX1 = lst.x1 - iRect.x1;
        let rY1 = lst.y1 - iRect.y1;
        let rX2 = lst.x2 - iRect.x1;
        let rY2 = lst.y2 - iRect.y1;
        let num = 0;
        iteratorImageData(image, scaleVal, (x, y, data, ind, first, getInd) => {
            if ((x >= rX1 && x <= rX2 && y >= rY1 && y <= rY2)) {
                if (image.width <= 60) {
                    setRedColor(data, getInd(x, y));
                } else if (image.width <= 160) {
                    setRedColor(data, getInd(x, y));
                    setRedColor(data, getInd(x + 1, y));
                    setRedColor(data, getInd(x, y + 1));
                    setRedColor(data, getInd(x + 1, y + 1));
                } else {
                    setRedColor(data, getInd(x, y));
                    setRedColor(data, getInd(x + 1, y));
                    setRedColor(data, getInd(x + 2, y));
                    setRedColor(data, getInd(x, y + 1));
                    setRedColor(data, getInd(x + 1, y + 1));
                    setRedColor(data, getInd(x + 2, y + 1));
                    setRedColor(data, getInd(x, y + 2));
                    setRedColor(data, getInd(x + 1, y + 2));
                    setRedColor(data, getInd(x + 2, y + 2));
                }
            }
        });
        return [image, num];
    }

    const pushPreviewImageEvent = async () => {
        let [image] = await drawPreviewImage();
        const { width, height } = image;
        let dx = Math.floor(width / 2);
        let dy = Math.floor(height / 2);
        let rx = Math.floor(dx * 0.95);
        let ry = Math.floor(dy * 0.95);
        setDx(dx);
        setDy(dy);
        setRx(rx);
        setRy(ry);
        let img = await dataToImage(image);
        setPreviewImage(img);
    }

    const buildPointList = () => {
        let image = imageToData(initImage.current);
        let iRect = initRect.current;
        let lst = selectDialogPickRect;
        let scaleVal = parseFloat(scale);
        let shiftHex = shift;
        let rX1 = lst.x1 - iRect.x1;
        let rY1 = lst.y1 - iRect.y1;
        let rX2 = lst.x2 - iRect.x1;
        let rY2 = lst.y2 - iRect.y1;
        let retList = [];
        iteratorImageData(image, scaleVal, (x, y, data, ind, first) => {
            if ((x >= rX1 && x <= rX2 && y >= rY1 && y <= rY2)) {
                let bgrHex = data2BgrHex(data, ind);
                retList.push({
                    x: iRect.x1 + x, y: iRect.y1 + y, color: bgrHex, shift: shiftHex
                })
            }
        });
        return retList;
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
            <span><input style={{ width: "40px" }} value={dx} onChange={(e) => setDx(e.target.value)} /></span>
            <span>相对Y:</span>
            <span><input style={{ width: "40px" }} value={dy} onChange={(e) => setDy(e.target.value)} /></span>
            <span><input type="checkbox" checked={x} /></span>
            <span >偏色值:</span>
            <span><input style={{ width: "47px" }} defaultValue={"151515"} value={shift} onChange={(e) => setShift(e.target.value)} /></span>
        </p>
        <p>
            <span>随机X:</span>
            <span><input style={{ width: "40px" }} value={rx} onChange={(e) => setRx(e.target.value)} /></span>
            <span>随机Y:</span>
            <span><input style={{ width: "40px" }} value={ry} onChange={(e) => setRy(e.target.value)} /></span>
            <span><input type="checkbox" checked={c} /></span>
            <span>间隔率:</span>
            <span><input style={{ width: "47px" }} value={scale} onChange={(e) => setScale(e.target.value)}
            //  onBlur={pushPreviewImageEvent} 
            /></span>
        </p>
        <p style={{ textAlign: "center" }}>
            <button style={{ width: "100%", padding: "3px" }} onClick={commitEvent}>确定</button>
        </p>
    </div>
}