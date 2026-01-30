const parsePoints = (points) => {
    points = [...points];
    let fX = points[0].x;
    let fY = points[0].y;
    let fColor = points[0].color;
    let fShift = points[0].shift;
    let featrue = points.splice(1).map(({ x, y, color, shift }) => {
        let rx = x - fX;
        let ry = y - fY;
        let line = `${rx}|${ry}|${color}`;
        if (shift) {
            line += `-${shift}`;
        }
        return line;
    }).join(",");
    let color = fColor;
    if (fShift) {
        color = `${color}-${fShift}`;
    }
    return [color, featrue];
}

export {
    parsePoints
}