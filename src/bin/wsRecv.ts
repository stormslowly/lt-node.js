#!/usr/bin/env node
import * as fs from "fs";
import {Server} from 'ws'
import {BlindDecoder} from "../index";
import express, * as Express from 'express';
import path from 'path'
import {createServer} from 'http'

const app = express();

app.use(Express.static(path.join(__dirname, '../../', 'html')));

const server = createServer(app);

const wss = new Server({ server });

const decoder = new BlindDecoder();

wss.on('connection', function connection(ws) {
    console.log('welcome');
    ws.on('message', function incoming(message) {
        console.log('->', message)
        try {
            const b = Buffer.from(message, 'hex');
            decoder.decode(b);
            if (decoder.isDone()) {
                console.log('done!!');
                fs.writeFileSync('./a.out', decoder.dump());
                process.exit(0);
            }
        } catch (e) {
            console.log(e);
        }
    });
});

server.listen(8080, function () {
    console.log('open http://localhost:8080 to capture qrcode to receive file');
});

