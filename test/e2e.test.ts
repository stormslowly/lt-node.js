import * as fs from "fs";
import * as path from "path";
import {BlindDecoder} from "../src";
import {Encoder} from "../src/codes";


describe('e2e', () => {

    it('decode 1000 bytes', () => {
        const file = fs.readFileSync(path.join(__dirname,'../README.md'));

        const encoder = new Encoder(file, 200);
        const deccoder = new BlindDecoder();

        let i = 0;
        while (!deccoder.isDone()) {

            const p = encoder.generatePackage();
            deccoder.decode(p);
            i++
        }

        console.log(i)

        const d = deccoder.dump();

        console.log(d);

        deccoder.dump().forEach((i, index) => {
            expect(file[index]).toBe(i);
        })


    })
})