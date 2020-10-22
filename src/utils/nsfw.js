import deepai from 'deepai';
deepai.setApiKey(process.env.DEEPAI);
/**
 * Function that detects if the image has any NSFW content.
 *
 * @param {Buffer} image - The image to check.
 * @returns {Promise<boolean>} If it is NSFW it will give true, otherwise false.
 */
export default async function (image) {
    const resp = await deepai.callStandardApi("nsfw-detector", { image });
    if(resp.output.nsfw_score > 0.5) return true;
    else return false;
}