const getRandomValues = require('get-random-values');
const axios = require('axios');
const pako = require('pako');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const baseUrl = 'https://tio.run';

// from tio.run

function getRandomBits(minBits) {
  return bufferToHex(getRandomValues(new Uint8Array(minBits + 7 >> 3)).buffer);
}

function bufferToHex(buffer) {
  var dataView = new DataView(buffer);
  var retval = "";

  for (var i = 0; i < dataView.byteLength; i++)
    retval += (256 | dataView.getUint8(i)).toString(16).slice(-2);

  return retval;
}


function stateToByteString() {
  var retval = "";
  $("#real-code").value = ($("#header").value && $("#header").value + "\n") + $("#code").value + ($("#footer").value && "\n" + $("#footer").value);
  iterate($$("[data-type]"), function(element) {
    if (element.parentNode.dataset.mask === "true")
      return;
    var type = element.dataset.type;
    retval += type;
    if (type == "R")
      return;
    retval += element.dataset.name + "\0";
    if (type == "F") {
      var value = textToByteString(element.value);
      retval += value.length + "\0" + value;
    }
    if (type == "V") {
      var subelements = $$("textarea, input[type=hidden]", element);
      retval += subelements.length + "\0";
      iterate(subelements, function(subelement) {
        retval += textToByteString(subelement.value) + "\0";
      });
    }
  });
  return retval;
}

function iterate(iterable, monad) {
  if (!iterable)
    return;
  for (var i = 0; i < iterable.length; i++)
    monad(iterable[i]);
}

function deflate(byteString) {
  let data = pako.deflateRaw(byteStringToByteArray(byteString), {"level": 9});
  return data;
}

function inflate(byteString) {
  return pako.inflateRaw(byteString);
}

function byteArrayToByteString(byteArray) {
  var retval = "";
  iterate(byteArray, function(byte) { retval += String.fromCharCode(byte); });
  return retval;
}

function textToByteString(string) {
  return unescape(encodeURIComponent(string));
}

function byteStringToText(byteString) {
  return decodeURIComponent(escape(byteString));
}

function byteStringToByteArray(byteString) {
  var byteArray = new Uint8Array(byteString.length);
  for(var index = 0; index < byteString.length; index++)
    byteArray[index] = byteString.charCodeAt(index);
  byteArray.head = 0;
  return byteArray;
}

// end


const getJS = async () => {
  const data = await axios.get(baseUrl);
  let url = data.data.match(/<script src="(.*?)"/g).filter(e => e.indexOf('frontend')>=0)[0];
  url = url.substring(13,url.length-1);
  const res = await axios.get(baseUrl+url);
  return res.data
};

const getRunUrl = jsFile => {
  return /var runURL = \"(.*?)\";/g.exec(jsFile)[1];
}

// const runCode = async (code, lang) => {
//   return await new Promise((resolve, reject) => {

//     const token = getRandomBits(128);

//     runRequest = new XMLHttpRequest;
//     runRequest.open("POST", runUrl + '/' + token, true);
//     runRequest.responseType = "arraybuffer";
//     runRequest.onreadystatechange =  () => {
      
//       if (runRequest.readyState != XMLHttpRequest.DONE)
//         return;
//       console.log('called');
//       var response = byteArrayToByteString(new Uint8Array(runRequest.response));
//       var statusCode = runRequest.status;
//       var statusText = runRequest.statusText;

//       runRequest = undefined;

//       if (statusCode === 204) {
//         // $("#run").onclick();
//         reject(" Cache miss. Running code...");
//         return;
//       }

//       // $("#run").classList.remove("running");
//       // $("#output").placeholder = "";

//       if (statusCode >= 400) {
//         reject("Error " + statusCode, statusCode < 500 ? response || statusText : statusText);
//         return;
//       }

//       try {
//         var rawOutput = inflate(response.slice(10));
//       } catch(error) {
//         reject("Error", "The server's response could not be decoded.");
//         return;
//       }

//       try {
//         response = byteStringToText(rawOutput);
//       } catch(error) {
//         response = rawOutput;
//       }

//       if (response.length < 32) {
//         reject("Error", "Could not establish or maintain a connection with the server.");
//       }

//       var results = response.substr(16).split(response.substr(0, 16));
//       console.log(results);
//       var warnings = results.pop().split("\n");
//       resolve({results, warnings});
//     };
//     runRequest.send(deflate('Vlang 1 eta F.code.tio 75 NINENAHAENATOENAAAENATSENTNOENIIENSAENATSENATOENATOENAHOENTOAEOOOOOOOOOOOOOF.input.tio 0 Vargs 0 R'));
//   });
// }

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
const runCode = async (code, lang) => {
  const token = getRandomBits(128);
  const r = await axios.post(baseUrl+runUrl+'/'+token, {
    responseType: 'arraybuffer',
    data: deflate('Vlang 1 eta F.code.tio 75 NINENAHAENATOENAAAENATSENTNOENIIENSAENATSENATOENATOENAHOENTOAEOOOOOOOOOOOOOF.input.tio 0 Vargs 0 R'),
  });
  let buf = str2ab(r.data);
  
  buf = new Uint8Array(buf);
  // console.log(buf);
  // console.log(new Uint8Array(r.data));
  console.log(buf.length);
  const res = byteArrayToByteString(buf);;

  console.log(res);
  
  console.log(inflate(res.slice(10)));
  return inflate(r.data);
  return await new Promise((resolve, reject) => {

    const token = getRandomBits(128);

    runRequest = new XMLHttpRequest;
    runRequest.open("POST", runUrl + '/' + token, true);
    runRequest.responseType = "arraybuffer";
    runRequest.onreadystatechange =  () => {
      
      if (runRequest.readyState != XMLHttpRequest.DONE)
        return;
      console.log('called');
      var response = byteArrayToByteString(new Uint8Array(runRequest.response));
      var statusCode = runRequest.status;
      var statusText = runRequest.statusText;

      runRequest = undefined;

      if (statusCode === 204) {
        // $("#run").onclick();
        reject(" Cache miss. Running code...");
        return;
      }

      // $("#run").classList.remove("running");
      // $("#output").placeholder = "";

      if (statusCode >= 400) {
        reject("Error " + statusCode, statusCode < 500 ? response || statusText : statusText);
        return;
      }

      try {
        var rawOutput = inflate(response.slice(10));
      } catch(error) {
        reject("Error", "The server's response could not be decoded.");
        return;
      }

      try {
        response = byteStringToText(rawOutput);
      } catch(error) {
        response = rawOutput;
      }

      if (response.length < 32) {
        reject("Error", "Could not establish or maintain a connection with the server.");
      }

      var results = response.substr(16).split(response.substr(0, 16));
      console.log(results);
      var warnings = results.pop().split("\n");
      resolve({results, warnings});
    };
    runRequest.send(deflate('Vlang 1 eta F.code.tio 75 NINENAHAENATOENAAAENATSENTNOENIIENSAENATSENATOENATOENAHOENTOAEOOOOOOOOOOOOOF.input.tio 0 Vargs 0 R'));
  });
}

let runRequest = null;
let runUrl = '/cgi-bin/static/fb67788fd3d1ebf92e66b295525335af-run';

(async () => {
  // const jsFile = await getJS();
  // runUrl = getRunUrl(jsFile);
  console.log(await runCode('', ''));
})();
