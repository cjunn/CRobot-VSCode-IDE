import "./index.scss"
import { useRef, useEffect } from 'react';
import closePath from "../../icon/close.png"
export default ({ children, title = "", visiable = false,setVisiable }) => {
    const ref = useRef(null);
    const initPosition = () => {
        const container = ref.current;
        const parentClient = ref.current?.parentElement.getBoundingClientRect();
        const selfClient = ref.current?.getBoundingClientRect();
        container.style.left = `${(parentClient.width - selfClient.width) / 4}px`;
        container.style.top = `${(parentClient.height - selfClient.height) / 4}px`;
    }

    useEffect(() => {
        const container = ref.current;
        let isDragging = false;
        let lstX = 0;
        let lstY = 0;
        const handleMouseDown = (e) => {
            if (e.target.closest('.d-head')) {
                isDragging = true;
                lstX = e.clientX;
                lstY = e.clientY;
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const curX = e.clientX;
            const curY = e.clientY;
            container.style.left = `${parseInt(container.style.left.replace("px", "") || "0") + (curX - lstX)}px`;
            container.style.top = `${parseInt(container.style.top.replace("px", "") || "0") + (curY - lstY)}px`;
            lstX = curX;
            lstY = curY;
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        container.addEventListener('mousedown', handleMouseDown);
        initPosition();

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <>
            <div className="dialog" ref={ref} style={{ display: visiable ? "block" : "none" }}>
                <div className="d-head">
                    <span>{title}</span>
                    <span className="d-close" onClick={()=>setVisiable(false)}>
                        <img src={closePath}></img>
                    </span>
                </div>
                <div className="d-body">{children}</div>
            </div>
        </>
    )
}