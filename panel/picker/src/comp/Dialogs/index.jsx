import "./index.scss"
import { useRef, useEffect, useState } from 'react';
import Dialog from "../Dialog";
import useStore from "../../state";
import AddPointDialog from "./AddPointDialog";
import AddBitDialog from "./AddBitDialog";
import AddOcrDialog from "./AddOcrDialog";
import AddOcr2Dialog from "./AddOcr2Dialog";
import PointDetailDialog from "./PointDetailDialog";

export default ({ }) => {
    const { pressY, pressI, dotsDetail, setDotsDetail, addPointVisiable, setAddPointVisiable, addBitVisiable, setAddBitVisiable, addOcrVisiable, setAddOcrVisiable, addOcr2Visiable, setAddOcr2Visiable } = useStore();
    return (
        <>
            <Dialog title="增加点" visiable={addPointVisiable} setVisiable={setAddPointVisiable}>
                <AddPointDialog />
            </Dialog>
            <Dialog title="增加图点" visiable={addBitVisiable} setVisiable={setAddBitVisiable}>
                <AddBitDialog />
            </Dialog>
            <Dialog title="点查询" visiable={dotsDetail != null} setVisiable={() => setDotsDetail(null)}>
                <PointDetailDialog pointVo={dotsDetail}></PointDetailDialog>
            </Dialog>
            <Dialog title="增加字点" visiable={addOcrVisiable} setVisiable={setAddOcrVisiable}>
                <AddOcrDialog />
            </Dialog>
            <Dialog title="增加复杂字点" visiable={addOcr2Visiable} setVisiable={setAddOcr2Visiable}>
                <AddOcr2Dialog />
            </Dialog>

        </>
    )
}