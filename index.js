const xhr = new XMLHttpRequest();
xhr.open(
    "POST",
    "https://mythologicinteractive.com/SFDGameServices.asmx",
    true
);

const sr =
    '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetNumberOfHostedGames xmlns="https://mythologicinteractive.com/Games/SFD/" /></soap:Body></soap:Envelope>';

xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
xhr.setRequestHeader(
    "SOAPAction",
    "https://mythologicinteractive.com/Games/SFD/GetNumberOfHostedGames"
);
xhr.send(sr);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
    }
};
