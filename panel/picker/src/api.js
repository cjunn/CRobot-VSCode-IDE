const TYPE_REQUEST = 1;
const TYPE_RESPONSE = 2;
const STATUS_SUCCESS = 0;
const STATUS_ERROR = -1;
const cache = {};

window.addEventListener('message', (event) => {
    let { uuid, type, data, status, msg } = event.data;
    if (TYPE_RESPONSE == type && cache[uuid]) {
        let { resolve, reject } = cache[uuid];
        delete cache[uuid];
        if (status == STATUS_ERROR) {
            reject(msg);
            return;
        }
        resolve(data);
    }
});

const apiRequest = ({ method, data }) => {
    let uuid = Date.now() + '' + Math.round(Math.random() * 100000);
    return new Promise((resolve, reject) => {
        cache[uuid] = {
            resolve,
            reject
        }
        window.parent.postMessage({ uuid, type: TYPE_REQUEST, method, data, client: true }, "*");
    })
}

const apiProxy = (obj) => {
    return new Proxy(obj, {
        get(target, method, receiver) {
            const func = target[method];
            if (typeof func === 'function') {
                return function (...args) {
                    console.log('api', method, args);
                    return apiRequest({ method, data: args[0] });
                };
            }
            return receiver();
        }
    });
}

const api = apiProxy({
    screenShot: () => {
    },
    testPick: (arg) => { 
    },
    addPoint:(arg)=>{
    },
    getPhoto:(id)=>{
    },
    getPoint:(id)=>{
    },
    queryPointList:(arg)=>{
    },
    delPoint:(arg)=>{
    },
    testPoint:(arg)=>{
    },
    testPointList:(arg)=>{
    }
})



export  {
   api
}