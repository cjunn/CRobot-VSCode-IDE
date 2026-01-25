const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

const current = () => {
    function pad2(n: number) { return n < 10 ? '0' + n : n }
    var date = new Date();
    return date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
}

export {
    delay,
    current
}