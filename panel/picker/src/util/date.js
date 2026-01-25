const currentDate = () => {
    let myDate = new Date();
    let Time2 = myDate.toISOString().slice(0, 10)
    return Time2.replace(/[^0-9]/ig, '').substring(0, 8)
}

export { currentDate }