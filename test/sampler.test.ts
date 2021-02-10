import {IdealSampler} from "../src/rand";


describe('sampler', () => {

    it('can recover', () => {
        const s1 = new IdealSampler(5);
        const s2 = new IdealSampler(5);

        const {seed, nodes} = s1.randGenerate();
        expect(s2.generateWith(seed)).toEqual(nodes)
    })

})