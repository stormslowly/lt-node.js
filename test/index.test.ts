import {Decoder, xorBuffer} from '../src';

describe('decoder', () => {
    const slicedPackets = [
        Buffer.alloc(1, 0x22),
        Buffer.alloc(1, 0x23),
        Buffer.alloc(1, 0x24),
    ];

    function xorPack(...indexes: number[]): [number[], Buffer] {
        const r = Buffer.alloc(1, 0);
        for (let index of indexes) {
            xorBuffer(r, slicedPackets[index])
        }
        return [indexes, r];
    }


    it('1,1,1', () => {

        const d = new Decoder({packets: 3, totalSize: 3});

        d.handlePacket([0], slicedPackets[0]);
        d.handlePacket([1], slicedPackets[1]);
        d.handlePacket([2], slicedPackets[2]);

        expect(d.isDone()).toBe(true);
        expect(d.dump().toString('hex')).toBe('222324');
    });

    it('1,2,2', () => {

        const d = new Decoder({packets: 3, totalSize: 3});

        d.handlePacket(...xorPack(0));
        d.handlePacket(...xorPack(0, 1));
        d.handlePacket(...xorPack(0, 2));

        expect(d.isDone()).toBe(true);
        expect(d.dump().toString('hex')).toBe('222324');
    });

    it('2,1,2', () => {

        const d = new Decoder({packets: 3, totalSize: 3});

        d.handlePacket(...xorPack(0, 1));
        d.handlePacket(...xorPack(0));
        d.handlePacket(...xorPack(0, 2));

        expect(d.isDone()).toBe(true);
        expect(d.dump().toString('hex')).toBe('222324');
    });

    it('3,2,1', () => {
        const d = new Decoder({packets: 3, totalSize: 3});

        d.handlePacket(...xorPack(0, 1, 2));
        d.handlePacket(...xorPack(1, 0));
        d.handlePacket(...xorPack(0));

        expect(d.isDone()).toBe(true);
        expect(d.dump().toString('hex')).toBe('222324');
    })
});
