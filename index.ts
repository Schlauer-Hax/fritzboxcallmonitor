import { Event } from "https://deno.land/x/tcp_socket@0.0.1/mods.ts";
import TCPClient, { FritzResponse } from "./tcpclient.ts";
import ZammadApi from "./zammadapi.ts";

import { config } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts';
if ((await Deno.permissions.query({ name: "read" })).state === "granted") {
    config({ export: true });
}

const client = new TCPClient(Deno.env.get("FRITZBOX_URL")!, Number(Deno.env.get("FRITZBOX_PORT")!));
const zammadapi = new ZammadApi(Deno.env.get("ZAMMADURL")!);
const allowedNumbers = Deno.env.get("ALLOWEDNUMBERS")?.split(",") || [];

const cache: { [key: string]: FritzResponse | undefined } = {};

client.socketclient.on(Event.connect, () => {
    console.log("Connected");
});

client.socketclient.on(Event.close, () => {
    console.log("Closed");
});

client.socketclient.on(Event.error, (err) => {
    console.log("Error", err);
});

const handlenewcall = (data: FritzResponse) => {
    if (allowedNumbers.includes(data.calledPhoneNumber!) || allowedNumbers.includes(data.callerId!)) {
        cache[data.connectionId] = data;
        zammadapi.triggerNewcall(data);
        console.log("New call", data);
    } else {
        console.log("Ignored New call (no allowedNumber)", data);
    }
}

client.on("outbound", handlenewcall);

client.on("inbound", handlenewcall);

client.on("connected", (data) => {
    if (cache[data.connectionId]) {
        zammadapi.triggerAnswer(cache[data.connectionId]!);
        console.log("Connected", data)
    } else {
        console.log("Ignored Connected (no allowedNumber)", data)
    }
});

client.on("disconnected", (data) => {
    if (cache[data.connectionId]) {
        zammadapi.triggerHangup(cache[data.connectionId]!);
        console.log("Disconnected", data)
        cache[data.connectionId] = undefined;
    } else {
        console.log("Ignored Disconnected (no allowedNumber)", data)
    }
});

await client.connect();