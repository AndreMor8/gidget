import sharp from 'sharp';
/**
 * Function that detects if the image has any NSFW content.
 * @param {Buffer} buffer The image to check
 * @returns {Promise<Boolean>} If it is NSFW it will give true, otherwise false.
 */
export default async function(buffer) {
    if(!Buffer.isBuffer(buffer)) throw new Error("'buffer' isn't a Buffer");
    const newThing = await sharp(buffer).resize(224, 224).jpeg().toBuffer();
    const tocheck = global.tfjs.node.decodeImage(newThing);
    const predictions = await global.nsfwjs.classify(tocheck);
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