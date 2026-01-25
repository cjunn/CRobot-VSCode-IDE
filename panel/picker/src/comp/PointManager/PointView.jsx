import "./PointView.scss"
import { useRef, useState,useImperativeHandle,forwardRef,memo, useEffect } from 'react';

export default memo(forwardRef(({ list,changeRowPoint },ref) => {
    const refBody = useRef();

    const getAllPoint = () => {
        let vals = refBody.current.querySelectorAll("tr");
        return Array.from(vals).map(e=>{
            let id = e.getAttribute("id")
            return {
                id
            }
        })
    }
    
    useImperativeHandle(ref, () => ({
        getAllPoint: getAllPoint,
      }));


    const buildTrHTML = (list)=>{
        if(!list){
            return;
        }
        changeRowPoint(undefined);
        refBody.current.innerHTML = "";
        refBody.current.innerHTML = list.map(({ name, fbl, type, date,id }) => {
            return `<tr key=${id} name=${name} id=${id}>
                <td>${name}</td>
                <td>${fbl}</td>
                <td>${type}</td>
                <td>${date}</td>
            </tr>`
        }).join("");
        refBody.current.querySelectorAll(`tr`).forEach(dom=>{
            dom.addEventListener("click", (e) => {
                let element = refBody.current.querySelector(`.pointViewSelected`);
                element?.classList.remove('pointViewSelected');
                e.currentTarget.classList.add("pointViewSelected");
                let id = e.currentTarget.getAttribute("id")
                changeRowPoint({id});
            });
        });


    }
    
    useEffect(() => {
        buildTrHTML(list);
        return () => {
        };
    }, [list]);



    return (
        <>
            <div className="pointView">
                <table>
                    <tbody ref={refBody}></tbody>
                </table>
            </div>
        </>
    )
}));