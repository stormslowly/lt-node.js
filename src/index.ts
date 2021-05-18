import crc32 from "buffer-crc32";
import {IdealSampler} from "./rand";

export const sum = (a: number, b: number) => {
    if ('development' === process.env.NODE_ENV) {
        console.log('boop');
    }
    return a + b;
};

type Graph = {
    edges: number[];
    data: Buffer;
};

export function xorBuffer(b1: Buffer, b2: Buffer) {
    if (b1.length === b2.length && b1.length > 0) {
        for (let i = 0; i < b1.length; i++) {

            b1[i] = b1[i] ^ b2[i]
        }
        return b1;
    }
    throw Error(`buffer size not matched ${b1.length}!=${b2.length}`);
}


export class BlindDecoder {
    private k: number = -1;
    total: number = -1;
    private decoder!: Decoder;

    public received = 0;

    seedRecord: Record<number, boolean> = {};

    decode(phyPacket: Buffer) {
        const len = phyPacket.length;

        const crc32Sum = phyPacket.slice(len - 4);
        const receivedCrc = crc32(phyPacket.slice(0, len - 4));
        if (crc32Sum.toString('hex') !== receivedCrc.toString('hex')) {
            console.error(`drop corrupted data package expect ${crc32Sum} but ${receivedCrc}`,);
            return;
        }

        const seed = phyPacket.readInt32BE(0);
        const k = phyPacket.readInt32BE(4);
        const total = phyPacket.readInt32BE(8);
        const data = phyPacket.slice(12, len - 4);
        
        if (this.seedRecord[seed]) {
            return;
        }

        if (this.k !== k || total !== this.total) {
            this.k = k;
            this.total = total;
            this.seedRecord = {};
            this.received = 0;
            this.decoder = new Decoder({packets: this.k, totalSize: this.total})
        }

        this.seedRecord[seed] = true;

        console.log(seed, k, total);
        this.received++;
        console.log('==>', this.received / k);
        this.decoder.decode(seed, data);
    }

    isDone() {
        return this.decoder?.isDone();
    }

    dump() {
        return this.decoder.dump();
    }
}

export class Decoder {
    solved: Record<number, Buffer> = {};
    graphCenter: Record<number, Graph[]> = {};
    private k: number = -1;
    private total: number = -1;
    private sampler: IdealSampler;

    constructor(config: { packets: number, totalSize: number }) {
        this.k = config.packets;
        this.total = config.totalSize;
        this.sampler = new IdealSampler(this.k);
    }

    decode(seed: number, data: Buffer) {
        const nodes = this.sampler.generateWith(seed);

        if (nodes.size === 1) {
            console.log(seed, nodes)
            console.log(data.toString("ascii"));
        }

        this.handlePacket(Array.from(nodes), data);
    }


    handlePacket(nodes: number[], data: Buffer) {
        if (nodes.length === 1 && !this.solved[nodes[0]]) {
            this.solved[nodes[0]] = data;
            const newSolved = this.removeGraph(nodes[0]);

            for (const g of newSolved) {
                this.handlePacket(g.edges, g.data);
            }
        } else {
            this.cancelWithSolved(nodes, data);
            if (nodes.length === 1) {
                this.handlePacket(nodes, data);
                return;
            }

            this.addToGraph(nodes, data)
        }
    }

    debug() {
        console.log(this.solved)
        for (const k in this.graphCenter) {
            console.log('-- ', k, '->', this.graphCenter[k]);
        }
    }

    private removeGraph(solvedIndex: number) {
        const graphs = this.graphCenter[solvedIndex];
        if (graphs && graphs.length) {
            let left = [];
            let solved = [];
            for (const g of graphs) {
                this.solveGraph(g, solvedIndex);
                if (g.edges.length === 1) {
                    if (g.edges[0] !== solvedIndex) {
                        solved.push(g);
                    }
                } else {
                    left.push(g);
                }
            }
            this.graphCenter[solvedIndex] = left;
            return solved;
        }
        return [];
    }

    private solveGraph(g: Graph, i: number) {
        if (g.edges.length > 1 && g.edges.includes(i)) {
            this.remove(g.edges, i);
            xorBuffer(g.data, this.solved[i]);
        }
    }


    private addToGraph(nodes: number[], data: Buffer) {
        for (let i of nodes) {
            if (this.graphCenter[i]) {
                this.graphCenter[i].push({edges: nodes, data});
            } else {
                this.graphCenter[i] = [{edges: nodes, data}];
            }
        }
    }


    private cancelWithSolved(nodes: number[], data: Buffer) {
        for (let node of nodes.slice()) {
            if (this.solved[node]) {
                this.remove(nodes, node);
                xorBuffer(data, this.solved[node]);
            }
        }
    }

    private remove(ns: number[], n: number) {
        const i = ns.indexOf(n);
        ns.splice(i, 1);
    }


    isDone() {
        return Object.keys(this.solved).length === this.k;
    }

    dump() {
        if (this.isDone()) {

            const dumped = Buffer.alloc(this.total);
            for (let i = 0; i < this.k; i++) {
                const b = this.solved[i];
                dumped.write(b.toString('hex'), i * b.length, b.length, 'hex');
            }
            return dumped;
        } else {
            throw Error('no done yet');
        }
    }
}