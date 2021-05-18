import * as fs from "fs";
import {BlindDecoder} from "../src";
import {Encoder} from "../src/codes";


const file = fs.readFileSync('/Volumes/huge/downloads/舒鹏飞简历2019.pdf');
const encoder = new Encoder(file, 178);
const decoder = new BlindDecoder();


let i = 0;
while (!decoder.isDone()) {

    const p = encoder.generatePackage();
    decoder.decode(p);
    console.log(i);
    i++;
}

const d = decoder.dump();


fs.writeFileSync('./test.pdf', d);
