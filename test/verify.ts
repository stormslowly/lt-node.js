import * as fs from "fs";
import {join} from "path"
import {BlindDecoder} from "../src";
import {Encoder} from "../src/codes";


const file = fs.readFileSync(join(__dirname,'test.epub'));
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


fs.writeFileSync('./test-received.epub', d);
