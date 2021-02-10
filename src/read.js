const { captureQrCodesFromCamera } = require('qrcode-camera-decode');



captureQrCodesFromCamera({verbosity:1})
    .subscribe((x)=>{
        console.log(x);
    })
