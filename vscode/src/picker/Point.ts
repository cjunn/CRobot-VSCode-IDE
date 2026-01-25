interface Point {
    id: number;
    name: string;
    type: string;
    fbl: string;
    date: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    swit:number;
    color: string;
    feature: string;
    exColor?: string;
    exFeature?: string;
    tolerance?:number;
    dir: number;
    sim: number;
    rx: number;
    ry: number;
    dx: number;
    dy: number;
    previed?:string,
}

export {
    Point
}