import * as fs from "fs";
import * as path from "path";
import {BlindDecoder} from "../src";
import {Encoder} from "../src/codes";


describe('e2e', () => {

    const file = fs.readFileSync(path.join(__dirname, '../README.md'));
    const encoder = new Encoder(file, 200);
    const decoder = new BlindDecoder();

    it('decode 1000 bytes', () => {


        let i = 0;
        while (!decoder.isDone()) {

            const p = encoder.generatePackage();
            decoder.decode(p);
            i++
        }

        console.log(i)

        const d = decoder.dump();

        console.log(d);

        decoder.dump().forEach((i, index) => {
            expect(file[index]).toBe(i);
        })
    })

    it('basic decode', () => {
        const p  = encoder.generatePackage()

        decoder.decode(p)

    })

})