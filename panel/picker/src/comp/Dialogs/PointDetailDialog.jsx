import { useRef, useState, memo, useEffect } from 'react';
import "./PointDetailDialog.scss"
export default ({ pointVo }) => {
    useEffect(() => {
        return () => {
        };
    }, []);

    return (
        <>
            <div className='pointDetailDialog'>
                <div >
                    <p><span>名称:</span><input style={{ width: "153px" }} defaultValue={pointVo?.name}/></p>
                    <p>
                        <span>类型:</span>
                        <input defaultValue={pointVo?.type}/>
                        <span style={{ marginLeft: "17px" ,width: "15px" }}>FBL:</span>
                        <input defaultValue={pointVo?.fbl}/>
                    </p>
                    <p>
                        <span style={{ marginLeft: "4px" }}>SX1:</span>
                        <input  defaultValue={pointVo?.x1}/>
                        <span style={{ marginLeft: "14px" }}>SY1:</span>
                        <input  defaultValue={pointVo?.y1}/>
                    </p>
                    <p>
                        <span style={{ marginLeft: "4px" }} >SX2:</span>
                        <input defaultValue={pointVo?.x2}/>
                        <span style={{ marginLeft: "14px" }} >SY2:</span>
                        <input defaultValue={pointVo?.y2}/>
                    </p>
                    <p>
                        <span style={{ marginLeft: "9px" }} >DX:</span>
                        <input defaultValue={pointVo?.dx}/>
                        <span style={{ marginLeft: "18px" }} >DY:</span>
                        <input defaultValue={pointVo?.dy}/>
                    </p>
                    <p>
                        <span style={{ marginLeft: "9px" }} >RX:</span>
                        <input defaultValue={pointVo?.rx}/>
                        <span style={{ marginLeft: "20px" }} >RY:</span>
                        <input defaultValue={pointVo?.ry}/>
                    </p>
                    <p>
                        <span>方向:</span>
                        <input defaultValue={pointVo?.dir}/>
                        <span style={{ marginLeft: "9px" }}>相似:</span>
                        <input defaultValue={pointVo?.sim}/>
                    </p>
                    <p>
                        <span>滑动:</span>
                        <input defaultValue={pointVo?.swit} />
                        <span style={{ marginLeft: "9px" }}>颜色:</span>
                        <input defaultValue={pointVo?.color}/>
                    </p>
                    <p>
                        <span>计算:</span>
                        <input style={{ width: "153px" }} defaultValue={pointVo?.feature} />
                    </p>
                </div>
            </div>
        </>
    )
};