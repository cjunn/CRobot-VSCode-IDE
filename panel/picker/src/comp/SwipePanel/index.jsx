import "./index.scss"
import { useRef, useState, useEffect } from 'react';
export default ({ panels }) => {
    let [curTab, setCurTab] = useState('');

    useEffect(() => {
        setCurTab((panels?.[0])?.[0]);
        return () => {
        };
    }, []);

    return (
        <>
            <div className="swipePanel">
                <div >
                    <ul className="tabArea" >
                        {panels.map(([title], idx) => {
                            return <li key={idx} className={`tabItem ${curTab == title ? "tabItemSelected" : ""}`} onClick={() => { setCurTab(title) }}>{title}</li>
                        })}
                    </ul>
                </div>
                <div className="tabDivArea"></div>
                <div className="activeArea">
                    {panels.map(([title, DomComponent], idx) => {
                        return <div key={idx} className="activeItemArea" style={{ display: curTab == title ? 'block' : 'none' }}>
                        <DomComponent/>
                    </div>
                    })}
                </div>
            </div>
        </>
    )
}