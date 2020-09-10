const tf = require('@tensorflow/tfjs-node');
const jimp = require('jimp');

/**
 * Function that detects if the image has any NSFW content.
 * @param {Buffer} buffer The image to check
 * @returns {Promise<Boolean>} If it is NSFW it will give true, otherwise false.
 */
module.exports = async function(model, buffer) {
    if(!Buffer.isBuffer(buffer)) throw new Error("'buffer' isn't a Buffer");
    const newImage = await jimp.read(buffer);
    newImage.resize(224, 224);
    const newThing = await newImage.getBufferAsync(jimp.MIME_JPEG);
    const tocheck = tf.node.decodeImage(newThing);
    const predictions = await model.classify(tocheck);
    let maxThing = [null, 0];
    for(const prediction of predictions) {
        if(maxThing[1] < prediction.probability) {
            maxThing = [prediction.className, prediction.probability];
        }
    }
    if (['Hentai', 'Sexy', 'Porn'].includes(maxThing[0])) {
        return true;   
    } else return false;
}