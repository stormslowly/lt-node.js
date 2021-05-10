import crc32 from "buffer-crc32";
import {xorBuffer} from "./index";
import {IdealSampler} from "./rand";

export class Encoder {
    k: number
    buffers: Buffer[];
    private smapler: IdealSampler;
    private fileSize: number;

    constructor(readonly buffer: Buffer, readonly  packSize: number) {
        this.fileSize = buffer.length;
        this.k = Math.ceil(this.fileSize / packSize);
        this.buffers = new Array(this.k);
        this.sliceBuffer();
        this.smapler = new IdealSampler(this.k);
    }

    private sliceBuffer() {

        const packSize = this.packSize;

        for (let i = 0; i < this.k; i++) {
            const start = i * packSize;
            const sliced = this.buffer.slice(start, start + packSize);
            if (sliced.length === packSize) {
                this.buffers[i] = sliced;
            } else {
                const b = Buffer.alloc(packSize);
                sliced.copy(b);
                this.buffers[i] = b;
            }
        }
    }

    generatePackage(): Buffer {
        const {seed, nodes} = this.smapler.randGenerate();

        const p = Buffer.alloc(this.packSize, 0);
        for (let i of nodes.values()) {
            try {
                xorBuffer(p, this.buffers[i]);
            } catch (e) {
                console.log(i);
                throw e;
            }
        }


        const crcSum = crc32(p);

        const headers = [
            seed,
            this.k,
            this.fileSize
        ];

        const headerByteLength = headers.length * 4;
        const phyPacket = Buffer.alloc(p.length + headerByteLength + crcSum.length, 0);

        for (let [i, data] of headers.entries()) {
            phyPacket.writeInt32BE(data, i * 4);
        }
        p.copy(phyPacket, headerByteLength);
        crcSum.copy(phyPacket, headerByteLength + p.length);

        return phyPacket;
    }
}


