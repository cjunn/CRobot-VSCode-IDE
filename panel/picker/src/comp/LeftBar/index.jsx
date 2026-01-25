import "./index.scss"
import { useRef, useState, useEffect } from 'react';
import { api } from "../../api";
import useStore from "../../state";
import { b64ToImage, imageSave } from "../../util/image";
export default ({ }) => {
    const fileInputRef = useRef(null);
    const { pickImage, setPickImage } = useStore();
    const screenShot = async () => {
        let image = await b64ToImage(await api.screenShot());
        setPickImage(image);
    }
    const saveImage = () => {
        imageSave(pickImage);
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => setPickImage(img);
            img.src = e.target.result; // 设置图片源为文件内容
        };
        reader.readAsDataURL(file); // 读取文件内容为 Data URL
    };

    return (
        <>
            <div className="leftBar">
                <span className="navItem" onClick={() => screenShot()}>
                    <div className="iconfont icon-xiangji leftNavItemFont"></div>
                    <div className="navTitle" >截图</div>
                </span>
                <span className="navItem" onClick={() => {
                    fileInputRef.current.click();
                }}>
                    <div className="iconfont icon-daijiazai leftNavItemFont"></div>
                    <div className="navTitle">加载</div>
                </span>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <span className="navItem" onClick={saveImage}>
                    <div className="iconfont icon-baocun leftNavItemFont"></div>
                    <div className="navTitle">保存</div>
                </span>
                <input type="file" accept="image/*" style={{ display: "none" }} />
                <hr />
            </div>
        </>
    )
}