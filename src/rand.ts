const PRNG_A = 16807;
const PRNG_M = Math.pow(2, 31) - 1;

function formula(seed: number) {
    const state = PRNG_A * seed % PRNG_M;
    return state;
}

class PRG {
    private seed: number = 42142;


    withSeed(seed: number) {
        this.seed = seed
    }

    next() {
        this.seed = formula(this.seed)
        return this.seed;
    }
}


function idealCdf(k: number) {
    const a = new Array(k + 1);
    a[1] = 1 / k;
    for (let i = 2; i <= k; i++) {
        a[i] = a[i - 1] + (1 / i / (i - 1));
    }
    return a;
}

export class IdealSampler {
    private cdf: number[];
    private prg: PRG;

    constructor(readonly k: number) {
        this.cdf = idealCdf(k);
        this.prg = new PRG();
        this.prg.withSeed(Math.round(Math.random() * 99999));
    }

    randGenerate() {
        const seed = this.prg.next();
        this.prg.withSeed(seed);
        const t = this.getT();
        const nodes = new Set<number>();
        while (nodes.size < t) {
            nodes.add(this.getI());
        }

        return {seed, nodes}
    }

    generateWith(seed: number) {
        this.prg.withSeed(seed);
        const t = this.getT();
        const nodes = new Set<number>();
        while (nodes.size < t) {
            nodes.add(this.getI());
        }
        return nodes;
    }

    private getI() {
        return this.prg.next() % this.k + 1;
    }

    getT() {
        const p = this.prg.next() / PRNG_M;
        for (let i = 1; i <= this.k; i++) {
            if (this.cdf[i] >= p) {
                return i
            }
        }

        return this.k;
    }
}