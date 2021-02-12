import * as fs from "fs";
import {BlindDecoder} from "../index";

const {captureQrCodesFromCamera} = require('qrcode-camera-decode');


const decoder = new BlindDecoder();

captureQrCodesFromCamera({
    rate: 5,
})
    .subscribe((x) => {
        const b = Buffer.from(x.binaryData).toString('ascii');

        decoder.decode(Buffer.from(b,'hex'));

        if(decoder.isDone()){
            fs.writeFileSync('./a.out', decoder.dump());
            process.exit(0);
        }
    })
