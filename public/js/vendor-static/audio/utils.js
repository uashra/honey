function initAudioContext()
{
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext)
    {
        throw "No WebAudio Support in this Browser";
    }
    navigator.getUserMedia = navigator.getUserMedia
            || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia
            || navigator.msGetUserMedia;
    if (!navigator.getUserMedia)
    {
        console.log("No getUserMedia Support in this Browser");
    }
    return new AudioContext();
}

function isOfType(type, obj) {
    if (obj === undefined || obj === null)
        return false;

    return type === Object.prototype.toString.call(obj).slice(8, -1);
}
