import { create } from "zustand";

const DefaultPoint = { x: 0, y: 0, color: "000000", "shift": "151515",checked:false };

const useStore = create((set) => ({
    //增加点窗口
    addPointVisiable:false,
    setAddPointVisiable: (val) => set(() => ({ addPointVisiable: val })),
    //增加图点窗口
    addBitVisiable:false,
    setAddBitVisiable: (val) => set(() => ({ addBitVisiable: val })),
    //增加字点窗口
    addOcrVisiable:false,
    setAddOcrVisiable: (val) => set(() => ({ addOcrVisiable: val })),
    //增加复杂字点窗口
    addOcr2Visiable:false,
    setAddOcr2Visiable: (val) => set(() => ({ addOcr2Visiable: val })),
    //点详情窗口
    dotsDetail:null,
    setDotsDetail: (val) => set(() => ({ dotsDetail: val })),
    //采集区图片
    pickImage: new Image(),
    setPickImage: (image) => set(() => ({ pickImage: image })),
    //采集点列表
    pickPointList: Array(18).fill(DefaultPoint),   //{ x, y, color, colorStyle,shift,shiftStyle,checked }
    setPickPoint: (index, point) => set((state) => ({ pickPointList: state.pickPointList.map((item, key) => key === index ? { ...item, ...point } : item) })),
    setAllPickPoint: (point) => set((state) => ({ pickPointList: state.pickPointList.map(item => ({ ...item, ...point })) })),
    resetAllPickPoint: () => set((state) => ({ pickPointList: state.pickPointList.map(item => ({ ...item, ...DefaultPoint })) })),
    //方向和相似度
    dirAndSim : { dir: 0, sim: 0.9 },
    setDirAndSim: (val) => set((state) => ({ dirAndSim: {...state.dirAndSim, ...val} })),
    //即时采集点位置
    pickPosition: { x: 0, y: 0 },
    setPickPosition: (val) => set(() => ({ pickPosition: val })),
    //已选择的区域
    selectPickRect: { x1: 0, y1: 0, x2: 0, y2: 0 },
    setSelectPickRect: (val) => set(() => ({ selectPickRect: val })),
    //预览区的图片
    previewImage: new Image(),
    setPreviewImage: (val) => set(() => ({ previewImage: val })),
    //设置区域选择标识
    selectPickFlag: false,
    setSelectPickFlag: (val) => set(() => ({ selectPickFlag: val })),
    switchSelectPickFlag: () => set((state) => ({ selectPickFlag: !state.selectPickFlag })),
    //是否设置窗口选择标识
    selectDialogPickFlag:false,
    setSelectDialogPickFlag: (val) => set(() => ({ selectDialogPickFlag: val })),
     //已选择的窗口区域
    selectDialogPickRect: undefined,
    setSelectDialogPickRect: (val) => set(() => ({ selectDialogPickRect: {...val} })),
    //按键X
    pressX: false,
    switchPressX: () => set((state) => ({ pressX: state.pressX+1 })),
    //按键C
    pressC: false,
    switchPressC: () => set((state) => ({ pressC: state.pressC+1 })),
    //按键R
    pressR: false,
    switchPressR: () => set((state) => ({ pressR: state.pressR+1 })),
    //按键H
    pressH: false,
    switchPressH: () => set((state) => ({ pressH: state.pressH+1 })),
    //按键E
    pressE: false,
    switchPressE: () => set((state) => ({ pressE: state.pressE+1 })),
    closePressE: () => set(() => ({ pressE: false })),
    //按键U
    pressU: false,
    switchPressU: () => set((state) => ({ pressU: state.pressU+1 })),
    //按键I
    pressI: false,
    switchPressI: () => set((state) => ({ pressI: state.pressI+1 })),
    //按键Y
    pressY: false,
    switchPressY: () => set((state) => ({ pressY: state.pressY+1 })),
    //按键J
    pressJ: false,
    switchPressJ: () => set((state) => ({ pressJ: state.pressJ+1 })),
}))

export default useStore;