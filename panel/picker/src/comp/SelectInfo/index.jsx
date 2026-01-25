import "./index.scss"
import useStore from "../../state";
import {  useEffect } from 'react';
const SELECT_TEXT = "选取中..";
const UN_SELECT_TEXT = "选取范围";


export default ({ }) => {
    const { selectPickFlag, switchSelectPickFlag, pressE, setSelectPickFlag, pickPointList, previewImage, selectPickRect } = useStore();

    useEffect(() => {
        if (pressE) {
            switchSelectPickFlag();
        }
    }, [pressE]);



    return (
        <>
            <div className="selectInfo">
                <div className="selectItem">
                    <div>
                        <button className="rangeBtn" onClick={switchSelectPickFlag}>{selectPickFlag ? SELECT_TEXT : UN_SELECT_TEXT}</button>
                    </div>
                    <div className="rangeInfo" ><span>宽高:</span><span >720,1080</span></div>
                    <div >
                        <span >
                            <input className="rangeInput" value={selectPickRect.x1} defaultValue={0} />
                            <input className="rangeInput" value={selectPickRect.y1} defaultValue={0} />
                            <input className="rangeInput" value={selectPickRect.x2} defaultValue={0} />
                            <input className="rangeInput" value={selectPickRect.y2} defaultValue={0} />
                        </span>
                        <span className="copySep">&nbsp;</span>
                        <button className="rangeBtn" onClick={() => {
                            function copyToClipboard(text) {
                                const textarea = document.createElement('textarea');
                                textarea.value = text;
                                document.body.appendChild(textarea);
                                textarea.select();
                                try {
                                    document.execCommand('copy');
                                    console.log('复制成功: ' + text);
                                } catch (err) {
                                    console.error('复制失败: ', err);
                                }
                                document.body.removeChild(textarea);
                            }
                            let text = `${selectPickRect.x1},${selectPickRect.y1},${selectPickRect.x2},${selectPickRect.y2}`
                            copyToClipboard(text);
                        }}>复制</button>
                    </div>
                </div>
                <div className="selectItem">
                    <span className="rangeInfo" >颜色描述：</span>
                    <input className="colorDescInput" value={pickPointList.filter(k => k && k.checked).map(k => k.color + "-" + k.shift).join("|")}></input>
                    <button className="rangeBtn" >复制</button>
                </div>
            </div>
        </>
    )
}