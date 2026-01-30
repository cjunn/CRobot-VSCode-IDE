import { Point } from "./Point";

abstract class PointParse {
    public abstract toScript(point: Point | Point[] | null): string;
}

class LuaPointParse extends PointParse {
    public toScript(point: Point | Point[] | null): string {
        throw new Error("Method not implemented.");
    }

}

class JsPointParse extends PointParse {

    private buildMultiColor(point: Point):string{
        if(!point.exColor){
            return `Findscr.findMultiColor(${point.x1},${point.y1},${point.x2},${point.y2},"${point.color}","${point.feature}",${point.dir}, ${point.sim});`;
        }else{
            return `Findscr.findComplexMultiColor(${point.x1},${point.y1},${point.x2},${point.y2},"${point.color}","${point.feature}","${point.exFeature}",${point.dir}, ${point.sim}, ${point.tolerance});`;
        }
    }

    public toScript(point: Point | Point[] | null): string {
        if (!point) {
            return `return "-1,-1"`;
        }
        if (!Array.isArray(point)) {
            return `
                Display.update();
                let [x,y] = ${this.buildMultiColor(point)};
                \`\${x}, \${y}\`;
            `;
        } else {
            let script = '';
            script += `let x=-1;
                       let y=-1;
                       let res="";
                       Display.keepCapture();`
            point.forEach(p => {
                script += `[x,y]=${this.buildMultiColor(p)}\n`
                script += `if(x!=-1){
                    res+="${p.name} ,";
                };
                `;
            });
            script += `
                Display.releaseCapture();
                res;
            `;
            return script;
        }
    }
}

export {
    PointParse,
    LuaPointParse,
    JsPointParse
}