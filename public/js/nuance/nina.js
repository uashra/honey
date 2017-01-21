// For the NinaStartSession CONNECT message
var nmaid = "Nuance_ConUHack2017_20170119_210049";
var nmaidKey = "0d11e9c5b897eefdc7e0aad840bf4316a44ea91f0d76a2b053be294ce95c7439dee8c3a6453cf7db31a12e08555b266d54c2300470e4140a4ea4c8ba285962fd";
var username;
var http_url = "https://webapi-demo.nuance.mobi:11443/nina-webapi/";

var companyName;
var appName;
var cloudModelVersion;

// // Audio handlers
// var audioContext = initAudioContext();
// var audioPlayer = new AudioPlayer(audioContext); // For the play audio command

function startSession() {

    // Check parameters of the connection message.
    var lNmaid = $('#nmaid')[0].value;
    if (lNmaid.length > 0) {
        nmaid = lNmaid;
    }
    var lNmaidKey = $('#nmaid_key')[0].value;
    if (lNmaidKey.length > 0) {
        nmaidKey = lNmaidKey;
    }
    var lUsername = $('#username')[0].value;
    if (lUsername.length > 0) {
        username = lUsername;
    }
    var lHttp_url = $('#http_url')[0].value;
    if (lHttp_url.length > 0) {
        http_url = lHttp_url;
    }

    var lCompanyName = $('#companyName')[0].value;
    if (lCompanyName.length > 0) {
        companyName = lCompanyName;
    }
    var lAppName = $('#appName')[0].value;
    if (lAppName.length > 0) {
        appName = lAppName;
    }
    var lCloudModelVersion = $('#cloudModelVersion')[0].value;
    if (lCloudModelVersion.length > 0) {
        cloudModelVersion = lCloudModelVersion;
    }

    $("#myModal").modal('hide');
    $('.secondaryTab').fadeIn();
}

// Variables for audio recording
var audioRecorder;
var shouldStopRecording = true;


// API calls set up here
function startSRRecording() {
    ui_startSRRecording();

    var engine = document.getElementById("sr_engine").value;
    var mode = document.getElementById("nte_mode").value;

        var request = new XMLHttpRequest();
        var url = http_url + "DoSpeechRecognition/";

        request.open("POST", url, true);
        request.responseType = "json";
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("nmaid", nmaid);
        request.setRequestHeader("nmaidkey", nmaidKey);
        if(engine === "NTE"){
          var command = {
              logSecurity: $('#sr_logSecurity')[0].value,
              sr_engine: engine,
              sr_engine_parameters: {
                  "operating_mode": mode
              },
              sr_audio_file: $('#srFromFile_url')[0].value // https://dl.dropboxusercontent.com/s/23knztcspmmrcii/9.%20Famous%20Full%20Obama%20Speech%20on%20Race%20Relations%20-%20A%20More%20Perfect%20Union.mp4
          };
       }else {
         var command = {
             sr_engine: engine,
             sr_audio_file: $('#srFromFile_url')[0].value // https://dl.dropboxusercontent.com/s/23knztcspmmrcii/9.%20Famous%20Full%20Obama%20Speech%20on%20Race%20Relations%20-%20A%20More%20Perfect%20Union.mp4
         };
       }

        request.send(JSON.stringify(command));

        $('#sr_request').text("Request sent: \n \n " + JSON.stringify(command, null, 4));
        $('#sr_results').text("Waiting for response...");

        request.onreadystatechange = function(event) {
            if (request.readyState === 4 && request.status === 200) {
                var response = request.response;
                if (response) {
                    $('#sr_results').text("Response: \n\n" + JSON.stringify(response, null, 4));
                }
            }
        };
}

function stopSRRecording() {
    ui_stopSRRecording();
}
