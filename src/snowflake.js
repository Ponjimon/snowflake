// @flow
import Long from 'long';

const lshift = (num, bits) => num * Math.pow(2, bits);
const nodeBits = 10;
const stepBits = 12;
const nodeMax = Long.fromNumber(-1)
    .xor(Long.fromNumber(-1).shiftLeft(nodeBits))
    .toNumber();
const stepMask = Long.fromNumber(-1)
    .xor(Long.fromNumber(-1).shiftLeft(stepBits))
    .toNumber();
console.log(nodeMax, stepMask);

const timeShift = nodeBits + stepBits;
const nodeShift = stepBits;
const encodeBase58Map =
    '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const ErrInvalidBase58 = () => console.error('invalid base58');
const Epoch = new Date('2018-01-01 00:00 +0000').getTime();

class ID {
    constructor(f) {
        this.f = f;
    }

    int64() {
        return this.f;
    }

    string() {
        return this.f.toString();
    }

    base2() {
        return this.f.toString(2);
    }

    base10() {
        return this.f.toString(10);
    }

    base36() {
        return this.f.toString(36);
    }

    base58() {
        if (this.f < 58) {
            return encodeBase58Map[this.f].toString();
        }

        let b = [];
        while (this.f >= 58) {
            b = b.push(encodeBase58Map[this.f % 58]);
            this.f /= 58;
        }
        b = b.push(encodeBase58Map[this.f]);

        for (let x = 0, y = b.length - 1; x < y; x += 1, y -= 1) {
            b[x] = b[y];
            b[y] = b[x];
        }

        return b.toString();
    }

    base64() {
        return Buffer.from(this.f).toString('base64');
    }
}

class Snowflake {
    constructor(node) {
        this.decodeBase58Map = new Uint8Array(256);
        for (let i = 0; i < encodeBase58Map.length; i++) {
            this.decodeBase58Map[i] = 0xff;
        }

        for (let i = 0; i < encodeBase58Map.length; i++) {
            this.decodeBase58Map[encodeBase58Map[i]] = i;
        }

        this.newNode(node);
    }

    newNode(node) {
        if (node < 0 || node > nodeMax) {
            console.error('Node number must be between 0 and 1023');
            return;
        }

        this.node = {
            time: 0,
            node,
            step: 0,
        };
    }

    generate() {
        const node = this.node;
        let now = Date.now();

        if (node.time === now) {
            node.step = Long.fromNumber(node.step + 1)
                .and(stepMask)
                .toNumber();
            if (node.step === 0) {
                while (now <= node.time) {
                    now = Date.now();
                }
            }
        } else {
            node.step = 0;
        }

        node.time = now;

        // const r = lshift(now - Epoch, timeShift) | lshift(node.node, nodeShift) | node.step;
        const time = Long.fromNumber(now - Epoch).shiftLeft(timeShift);
        console.log(time.toNumber());
        const shiftedNode = Long.fromNumber(node.node).shiftLeft(nodeShift);
        const r = time
            .or(shiftedNode)
            .or(node.step)
            .toNumber();
        // console.log(now, time.toNumber(), shiftedNode.toNumber(), node.step, r);
        // const r = bitwise.or(
        //     bitwise.or(
        //         lshift(now - Epoch, timeShift),
        //         lshift(node.node, nodeShift)
        //     ),
        //     node.step
        // );
        return new ID(r);
    }
}

export default Snowflake;
