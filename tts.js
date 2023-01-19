"strict mode";
var crypto = require("crypto");
function TTS() {
    this.synthesizer = null;
    this.sdk = null;
}

TTS.prototype = {
    initialize: function () {
        this.sdk = require("microsoft-cognitiveservices-speech-sdk");
    },

    excute: function (text, callback) {

        let audioFile = crypto.randomBytes(20).toString('hex');

        const speechConfig = this.sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
        const audioConfig = this.sdk.AudioConfig.fromAudioFileOutput("./output/" + audioFile +".wav");

        // The language of the voice that speaks.
        speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

        this.synthesizer = new this.sdk.SpeechSynthesizer(speechConfig, audioConfig);


        let sdk = this.sdk;
        let synthesizer = this.synthesizer;
        let visemsInfo = [];

        this.synthesizer.visemeReceived = function (s, e) {
            visemsInfo.push({'audioOffset': e.audioOffset / 10000, "id": e.visemeId});
        }

        this.synthesizer.speakTextAsync(text,
            function (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log("synthesis finished.");
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails +
                        "\nDid you set the speech resource key and region values?");
                }
                synthesizer.close();
                synthesizer = null;
                callback({file:audioFile, info: visemsInfo});
            },
            function (err) {
                console.trace("err - " + err);
                synthesizer.close();
                synthesizer = null;
                callback(null);
            });
    }

}

module.exports = TTS;