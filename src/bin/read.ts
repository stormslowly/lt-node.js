const { captureQrCodesFromCamera } = require('qrcode-camera-decode');


captureQrCodesFromCamera({
    verbosity: 2,
    rate: 5,
})
    .subscribe((x) => {
        console.log(x);

    })
