import {Encoder} from "../codes";

const qrcode = require('qrcode-terminal');

const fs = require('fs');
const path = require('path');

const fileNameArg = process.argv[2];


const filepath = path.isAbsolute(fileNameArg) ? fileNameArg : path.join(process.cwd(), fileNameArg);


const fileBuffer = fs.readFileSync(filepath);


const encoder = new Encoder(fileBuffer, 116);

qrcode.setErrorLevel('L');

setInterval(() => {
    const buffer = encoder.generatePackage();

    qrcode.generate(buffer.toString('hex'), (x: string) => {
        console.clear();
        console.log('');
        console.log(x);
    });
}, 300);