const rq = require('qrcode-terminal');

let i = 0;

rq.set
setInterval(() => {
    rq.generate(Buffer.alloc(10, i % 256).toString('ascii'), (x) => {
        console.clear();
        console.log(x);
        console.log(i);
    });
    i++;
}, 1000)
