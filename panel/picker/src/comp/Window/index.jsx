import "./index.scss"
import { useRef, useState, useEffect } from 'react';
export default ({ children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const container = ref.current;
        let isDragging = false;
        let lstX = 0;
        let lstY = 0;
        const handleMouseDown = (e) => {
            if (e.target.closest('.w_head')) {
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

        const handleRestSize = ()=>{
            const { width, height } = container.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            container.style.left = `${(windowWidth - width) / 2}px`;
            container.style.top = `${(windowHeight - height) / 2}px`;
        }
        handleRestSize();
        window.addEventListener('resize', handleRestSize);
        container.addEventListener('mousedown', handleMouseDown);
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);



    return (
        <>
            <div className="window" ref={ref}>
                <div className="w_head">
                    CRobot采集器
                </div>
                <div className="w_body">{children}</div>
            </div>
        </>
    )
}