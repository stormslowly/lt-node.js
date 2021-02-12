import {IdealSampler} from "../src/rand";


describe('sampler', () => {

    it('can recover', () => {
        const s1 = new IdealSampler(5);
        const s2 = new IdealSampler(5);

        const {seed, nodes} = s1.randGenerate();
        expect(s2.generateWith(seed)).toEqual(nodes)
    })
    
    it('real',()=>{
       let  s = new IdealSampler(18)
        console.log(s.generateWith(1547958314));
    })

})