import { Exception } from "sass";
import {api} from "../../api";
import "./index.scss"
import toastr, { error } from 'toastr';
import PointView from "./PointView"
import { useRef, useState, useEffect } from 'react';
import useStore from "../../state";
import Swal from 'sweetalert2';
import { b64ToImage } from "../../util/image";
export default ({ }) => {
    const { setPreviewImage,setDotsDetail } = useStore();
    const pView = useRef(null);
    let rowPoint = useRef(null);
    let refName = useRef(null);
    let refFbl = useRef(null);
    let refType = useRef(null);
    let [points, setPoints] = useState([]);

    const initData = async () => {
        let r = (await api.queryPointList({}));
        setPoints(r);
    }

    const onSearch = async () => {
        let name = refName.current.value;
        let fbl = refFbl.current.value;
        let type = refType.current.value;
        let val = (await api.queryPointList({ name, fbl, type }));
        setPoints(val);
    }

    useEffect(() => {
        initData();
        return () => {
        };
    }, []);

    return (
        <>
            <div className="pointManager">
                <div className="pointSearch">
                    <div>
                        <p>
                            <span>图色点:</span>
                            <input style={{ height: "12px", width: "168px" }} ref={refName} />
                        </p>
                        <p >
                            <span>分辨率:</span>
                            <select style={{ width: "67px", height: "20px", }} ref={refFbl}>
                                <option value=""></option>
                                <option value="720">720</option>
                                <option value="1080">1080</option>
                            </select>
                            <span style={{ marginLeft: "26px" }}>类型:</span>
                            <select style={{ widows: "67px", height: "20px", }} ref={refType}>
                                <option value=""></option>
                                <option value="mul">mul</option>
                                <option value="fix">fix</option>
                                <option value="swi">swi</option>
                            </select>
                        </p>
                    </div>
                    <button className="rangeBtn" style={{ height: "40px", width: "66px" }} onClick={onSearch}>搜 索</button>
                </div>
                <PointView ref={pView} list={points} changeRowPoint={async (e) => {
                    rowPoint.current = e;
                    if(e){
                        let img = await b64ToImage(await api.getPhoto(e.id));
                        setPreviewImage(img);
                    }
                }}></PointView>
                <div className="pointBtns">
                    <p>
                        <button className="rangeBtn" style={{ width: "130px", marginRight: "25px", height: "22px" }} onClick={async () => {
                            if (!rowPoint.current) {
                                throw "未选择点!";
                            }
                            let val = await api.getPoint(rowPoint?.current?.id);
                            setDotsDetail(val);
                            //emitter.emit(PointDetailVisiableEvent, pointDto);
                        }}>查看该点</button>
                        <button className="rangeBtn" style={{ width: "130px", height: "22px" }} onClick={async () => {
                            if (!rowPoint.current) {
                                throw "未选择点!";
                            }
                            let res = await api.testPoint(rowPoint.current);
                            toastr.info(res);
                        }}>测试该点</button>
                    </p>
                    <p>
                        <button className="rangeBtn" style={{ width: "130px", marginRight: "25px", height: "22px" }} onClick={async () => {
                            const vals = (await api.testPointList(pView.current.getAllPoint()));
                            toastr.info(vals);
                        }}>迭代测试</button>
                        <button className="rangeBtn" style={{ width: "130px", height: "22px" }} onClick={async () => {
                            if (!rowPoint.current) {
                                throw "未选择点!";
                            }
                            Swal.fire({
                                text: '即将删除该点',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: '确认',
                                cancelButtonText: '取消',
                            }).then(async (result) => {
                                if (result.isConfirmed) {
                                    await api.delPoint(rowPoint.current.id);
                                    toastr.info("删除成功");
                                    onSearch();
                                }
                            });
                        }}>删除该点</button>
                    </p>
                </div>

            </div>

        </>
    )
}