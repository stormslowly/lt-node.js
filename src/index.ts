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


export class Decoder {
    solved: Record<number, Buffer> = {};
    graphCenter: Record<number, Graph[]> = {};
    private k: number;
    private size: number;
    private total: number;

    constructor(config: { packets: number, packetSize: number, totalSize: number }) {
        this.k = config.packets;
        this.size = config.packetSize;
        this.total = config.totalSize;
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

    private removeGraph(i: number) {
        const graphs = this.graphCenter[i];
        if (graphs && graphs.length) {
            let left = [];
            let solved = [];
            for (const g of graphs) {
                this.solveGraph(g, i);
                if (g.edges.length === 1) {
                    if (g.edges[0] !== i) {
                        solved.push(g);
                    }
                } else {
                    left.push(g);
                }
            }
            this.graphCenter[i] = left;
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
                dumped.write(b.toString('hex'), i * this.size, this.size, 'hex');
            }
            return dumped;
        } else {
            throw Error('no done yet');
        }
    }
}