import useStore from "../../state";
import "./index.scss"
import { useRef, useState, useEffect } from 'react';
import toastr from 'toastr';
import { api } from "../../api";
import { toRGB } from "../../util/image";
import { parsePoints } from "../../util/point";
export default ({ }) => {
    const [result, setResult] = useState("-1,-1");
    const { switchPressI, switchPressH, switchPressU, switchPressJ, dirAndSim, setDirAndSim, selectPickRect, pickPointList, pressR, pressH, setPickPoint, setAllPickPoint, resetAllPickPoint } = useStore();

    useEffect(() => {
        if (pressR) {
            resetAllPickPoint();
        }
    }, [pressR]);
    useEffect(() => {
        if (pressH) {
            (async () => {
                let points = pickPointList.filter(val => val.checked);
                if (!points || points.length < 2) {
                    toastr.error("点位数量必须大于1个!");
                    return;
                }
                let [color,feature] = parsePoints(points);
                let vals = {
                    ...selectPickRect,
                    ...dirAndSim,
                    color,
                    feature
                }
                setResult('-e,-e');
                setResult((await api.testPick(vals)));
            })();
        }
    }, [pressH]);




 

    return (
        <>
            <div >
                <div className="pickHeads">
                    <span className="pickTitle pickHeade" style={{ width: "15px" }}>序</span>
                    <span className="pickTitle pickHeade" style={{ width: "65px", textAlign: "center" }}>坐标</span>
                    <span className="pickTitle pickHeade" style={{ width: "25px", textAlign: "center" }}>取色</span>
                    <span className="pickTitle pickHeade" style={{ width: "65px", textAlign: "center" }}>颜色值</span>
                    <span className="pickTitle pickHeade" style={{ width: "65px", textAlign: "center" }}>偏色</span>
                    <span className="pickTitle pickHeade" style={{ width: "25px", textAlign: "center", position: "relative", top: "2px", left: "10px" }}>
                        <input type="checkbox" onChange={(e) => setAllPickPoint({ checked: e.target.checked })} />
                    </span>
                </div>
                <div className="pickBody">
                    {pickPointList.map((val, index) => (
                        <div key={index} className="pickLine">
                            <span>
                                <span className="pickIndex">{index + 1}</span>
                            </span>
                            <span>
                                <input className="pickInput"
                                    onChange={(e) => {
                                        let vals = e.target.value.split(',');
                                        setPickPoint(index, { x: Number(vals[0] || 0), y: Number(vals[1] || 0) })
                                    }}
                                    value={(val.x || 0) + "," + (val.y || 0)}
                                    defaultValue={"0,0"}></input>
                            </span>
                            <span>
                                <span className="pickColor"
                                    style={{ backgroundColor: `rgb(${toRGB(val.color).r || 0},${toRGB(val.color).g || 0},${toRGB(val.color).b || 0})` }} >
                                </span>
                            </span>
                            <span>
                                <input className="pickInput"
                                    onChange={(e) => setPickPoint(index, { color: e.target.value })}
                                    defaultValue={"000000"}
                                    value={val.color}>
                                </input>
                            </span>
                            <span>
                                <input className="pickInput"
                                    onChange={(e) => setPickPoint(index, { shift: e.target.value })}
                                    defaultValue={"151515"}
                                    value={val.shift}>
                                </input>
                            </span>
                            <span>
                                <input type="checkbox"
                                    onChange={(e) => setPickPoint(index, { checked: e.target.checked })}
                                    style={{ position: "relative", top: "1px" }}
                                    checked={val.checked}>
                                </input>
                            </span>
                        </div>
                    ))}
                </div>
                <div className="pickOpt1">
                    <span className="pickTitle">查找方向</span>
                    <span >
                        <select className="pickTitle" value={dirAndSim.dir} onChange={(e) => setDirAndSim({ dir: e.target.value })}>
                            <option value="0" >0:从上左到下右</option>
                            <option value="1">1:从上右到下左</option>
                            <option value="2">2:从下左到上右</option>
                            <option value="3">3:从下右到上左</option>
                            <option value="4">4:从左上到右下</option>
                            <option value="5">5:从右上到左下</option>
                            <option value="6">6:从左下到右上</option>
                            <option value="7">7:从右下到左上</option>
                        </select>
                    </span>
                    <span className="pickTitle" style={{ marginLeft: "20px" }}>相似度  </span>
                    <input className="pickOptSim" defaultValue="0.9" value={dirAndSim.sim} onChange={(e) => setDirAndSim({ sim: e.target.value })} />
                    <button className="pickBtnItem pickRest" title="重置"
                    // onClick={restEvent}

                    >R</button>
                </div>
                <div className="pickOpt2">
                    <span >
                        <select className="pickTitle">
                            <option value="0">图正常</option>
                            <option value="1">图旋转</option>
                        </select>
                    </span>
                    <span className="pickTestResult">
                        <span >结果: </span>
                        <span >{result}</span>
                    </span>
                </div>
                <div className="pickBtns">
                    <button className="pickBtnItem" onClick={switchPressH}>测试</button>
                    <button className="pickBtnItem" onClick={switchPressJ}>增点</button>
                    <button className="pickBtnItem" onClick={switchPressU}>增图</button>
                    <button className="pickBtnItem" onClick={switchPressI}>增字</button>
                    <button className="pickBtnItem" onClick={switchPressU}>增字2</button>
                    <button className="pickBtnItem">复制</button>
                </div>
            </div>
        </>
    )
}