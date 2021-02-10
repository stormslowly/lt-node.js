import {BlindDecoder} from "../src";
import {Encoder} from "../src/codes";


describe('e2e', () => {

    it('decode 1000 bytes', () => {
        const fileSize = 10;
        const file = Buffer.alloc(fileSize, 0);
        for (let i = 0; i < fileSize; i++) {
            file[i] = i % 256;
        }

        const encoder = new Encoder(file, 1);
        const deccoder = new BlindDecoder();

        let i = 0
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