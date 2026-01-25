import { base64ToUInt8, uInt8ToBase64 } from "../util/Base64s";

const TYPE_REQUEST = 1;
const TYPE_RESPONSE = 2;
const STATUS_SUCCESS = 0;
const STATUS_ERROR = -1;

class Message {


    public type: number;
    public uuid: string;
    constructor(type: number, uuid: string) {
        this.type = type;
        this.uuid = uuid;
    }
}

class Request extends Message {
    public method: string | undefined;
    public data: any;

    constructor(method: string, uuid: string, data: any) {
        super(TYPE_REQUEST, uuid);
        this.method = method;
        this.data = data;
    }

}


class Response extends Message {
    public status: number | undefined;
    public msg: string | undefined;
    public data: any;


    constructor(uuid: string, status: number, msg: string, data: any) {
        super(TYPE_RESPONSE, uuid);
        this.status = status;
        this.msg = msg;
        this.data = data;
    }

}

const buildSuccessResponse = (uuid: string, data: any) => {
    return new Response(uuid, STATUS_SUCCESS, "", data);
}

const buildErrorResponse = (uuid: string, msg: string) => {
    return new Response(uuid, STATUS_ERROR, msg, "");
}


const toJson = (message: Request | Response): string => {
    return JSON.stringify(message);
}

const toMessage = (json: string): Request | Response => {
    let message = JSON.parse(json);
    return message;
}

export { Message, Request, Response, buildSuccessResponse, buildErrorResponse, toJson, toMessage, TYPE_REQUEST, TYPE_RESPONSE, STATUS_SUCCESS, STATUS_ERROR };