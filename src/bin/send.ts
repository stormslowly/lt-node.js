import {Encoder} from "../codes";

const qrcode = require('qrcode-terminal');

const fs = require('fs');
const path = require('path');

const fileNameArg = process.argv[2];


const filepath = path.isAbsolute(fileNameArg) ? fileNameArg : path.join(process.cwd(), fileNameArg);


const fileBuffer = fs.readFileSync(filepath, "binary")


const encoder = new Encoder(fileBuffer, 500);


setInterval(() => {
    const buffer = encoder.generatePackage();

    qrcode.generate(buffer.toString('ascii'), (x: string) => {
        console.clear();
        console.log(x);
    });
}, 500);