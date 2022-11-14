import { FritzResponse } from "./tcpclient.ts";

export default class ZammadApi {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    triggerNewcall(data: FritzResponse) {
        fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "event": "newCall",
                "from": data.callerId,
                "to": data.calledPhoneNumber,
                "direction": data.type === "outbound" ? "out" : "in",
                "callId": data.zammadid
            })
        }).then(response => response.json()).then(data => console.log('Zammad', data))
    }
    triggerAnswer(cache: FritzResponse) {
        console.log({
            "event": "answer",
            "from": cache.callerId,
            "to": cache.calledPhoneNumber,
            "direction": cache.type === "outbound" ? "out" : "in",
            "callId": cache.zammadid,
        });
        fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "event": "answer",
                "from": cache.callerId,
                "to": cache.calledPhoneNumber,
                "direction": cache.type === "outbound" ? "out" : "in",
                "callId": cache.zammadid,
            })
        }).then(response => response.json()).then(data => console.log('Zammad', data))
    }
    triggerHangup(cache: FritzResponse) {
        fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "event": "hangup",
                "from": cache.callerId,
                "to": cache.calledPhoneNumber,
                "direction": cache.type === "outbound" ? "out" : "in",
                "callId": cache.zammadid,
            })
        }).then(response => response.json()).then(data => console.log('Zammad', data))
    }
}