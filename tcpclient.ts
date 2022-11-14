import { Client, Packet, Event } from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

export default class TCPClient {
    socketclient: Client;

    eventListener: { event: string, callback: (data: FritzResponse) => void }[] = []

    constructor(hostname: string, port: number) {
        this.socketclient = new Client({
            hostname: hostname,
            port: port,
        });
    }

    async connect() {
        // Receive message
        this.socketclient.on(Event.receive, (_: Client, data: Packet) => {
            const split = data.toString().split(";");
            const response = this.generateResponse(split)
            if (response) {
                response.zammadid = String(new Date().getTime())+String(Math.random())
                this.eventListener
                    .filter(listener => listener.event === response.type)
                    .forEach(listener => listener.callback(response))
            } else {
                console.log("Unknown message", split)
            }
        });

        await this.socketclient.connect();
    }

    generateResponse(data: string[]): FritzResponse | undefined {
        const split = data;
        switch (split[1]) {
            case "CALL":
                //Outbound: Date;CALL;ConnectionId;Extension;CallerId;CalledPhoneNumber;
                return {
                    type: "outbound",
                    date: split[0],
                    connectionId: split[2],
                    extension: split[3],
                    callerId: split[4],
                    calledPhoneNumber: split[5].replace('#', '')
                }
            case "RING":
                // Inbound: Date;RING;ConnectionId;CallerId;CalledPhoneNumber;
                return {
                    type: "inbound",
                    date: split[0],
                    connectionId: split[2],
                    callerId: split[3],
                    calledPhoneNumber: split[4]
                }
            case "CONNECT":
                // Connected: Date;CONNECT;ConnectionId;Extension;Number;
                return {
                    type: "connected",
                    date: split[0],
                    connectionId: split[2],
                    extension: split[3],
                    callerId: split[4].replace('#', '')
                }
            case "DISCONNECT":
                // Disconnected: Date;DISCONNECT;ConnectionID;DurationInSeconds;
                return {
                    type: "disconnected",
                    date: split[0],
                    connectionId: split[2],
                    duration: split[3]
                }
        }
    }

    on(event: "inbound" | "outbound" | "connected" | "disconnected", callback: (data: FritzResponse) => void) {
        this.eventListener.push({ event, callback })
    }
}

export type FritzResponse = {
    type: "inbound" | "outbound" | "connected" | "disconnected",
    date: string,
    connectionId: string,
    extension?: string, // when type is connected or outbound
    callerId?: string, // when type is inbound or outbound or connected
    calledPhoneNumber?: string, // when type is inbound or outbound 
    duration?: string, // when type is disconnected
    zammadid?: string
}