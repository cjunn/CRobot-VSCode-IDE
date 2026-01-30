import { useRef, useEffect, useState } from 'react';
import toastr from 'toastr';
import useStore from "../../state";
import { api } from "../../api";
import { currentDate } from "../../util/date";
import { imageToB64 } from "../../util/image";
import { parsePoints } from '../../util/point';
export default ({ }) => {
    const ref = useRef(null);
    const [x, setX] = useState(false);
    const [c, setC] = useState(false);
    const { previewImage, dirAndSim, pressJ, setAddPointVisiable, pickPosition, pressX, pressC, pickPointList, addPointVisiable, selectPickRect } = useStore();
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);
    const [rx, setRx] = useState(0);
    const [ry, setRy] = useState(0);
    const [name, setName] = useState('');
    const [fbl, setFbl] = useState(720);
    const [type, setType] = useState("mul");
    const [swit, setSwit] = useState(0);


    const getFirstPoint = () => {
        return pickPointList.filter(l => l.checked)[0]
    }


    useEffect(() => {
        if (addPointVisiable) {
            setName('');
            setDx(0);
            setDy(0);
            setRx(0);
            setRy(0);
            setX(false);
            setC(false);
        }
    }, [addPointVisiable]);

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


    useEffect(() => {
        if (pressJ) {
            if (!getFirstPoint()) {
                toastr.error("请选择一个点");
                return;
            }
            setAddPointVisiable(true)
        }
    }, [pressJ]);

    const buildFixOrSwi = (point, points) => {
        if ("swi" == point.type) {
            point.x1 = points?.[0]?.x + "";
            point.y1 = points?.[0]?.y + "";
            point.x2 = points?.[1]?.x + "";
            point.y2 = points?.[1]?.y + "";
            return;
        }
        if ("fix" == point.type) {
            point.x1 = points?.[0]?.x + "";
            point.y1 = points?.[0]?.y + "";
            return;
        }
    }

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

    const commitEvent = async () => {
        if (checkValue() > 0) {
            toastr.error("字段请填写完整!");
            return
        }
        let points = pickPointList.filter(val => val.checked);
        let previed = imageToB64(previewImage);
        let [color,feature] = parsePoints(points);
        let val = { name, fbl, dx, dy, rx, ry, type, swit, ...dirAndSim, color,feature, ...selectPickRect, date: currentDate(), previed }
        buildFixOrSwi(val,points);
        let res = await api.addPoint(val);
        toastr.info("点增加成功!");
        setAddPointVisiable(false);
        return res;
    }


    return <div className="innerAddPoint" ref={ref} >
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
            <span><input type="checkbox" checked={x} /></span>
            <span>点类型:</span>
            <select attr="type" className="addPointFbl" style={{ width: "55px" }} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="mul">mul</option>
                <option value="fix">fix</option>
                <option value="swi">swi</option>
            </select>
        </p>
        <p>
            <span>随机X:</span>
            <span><input style={{ width: "40px" }} defaultValue={"0"} value={rx} onChange={(e) => setRx(e.target.value)} /></span>
            <span>随机Y:</span>
            <span><input style={{ width: "40px" }} defaultValue={"0"} value={ry} onChange={(e) => setRy(e.target.value)} /></span>
            <span><input type="checkbox" checked={c} /></span>
            <span>&nbsp;滑动T:</span>
            <span><input style={{ width: "47px" }} defaultValue={"0"} value={swit} onChange={(e) => setSwit(e.target.value)} /></span>
        </p>
        <p style={{ textAlign: "center" }}>
            <button style={{ width: "100%", padding: "3px" }} onClick={commitEvent}>确定</button>
        </p>
    </div>
}