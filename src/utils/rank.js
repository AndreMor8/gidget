// swiftcord/src/Canvas.js
import Canvas from "canvas";
import path from 'path';
import commons from './commons.js';
const { __dirname } = commons(import.meta.url);
let rankCard;
export default async ({ username, discrim, level, rank, neededXP, currentXP, avatarURL }, color = "FFFFFF") => {
    if (!username) throw new Error("No username was provided!");
    if (typeof level !== "number" && !level) throw new Error("No level was provided!");
    if (!rank) throw new Error("No rank was provided!");
    if (!neededXP) throw new Error("No totalXP was provided!");
    if (!currentXP) throw new Error("No currentXP was provided!");
    if (!avatarURL) throw new Error("No avatarURL was provided!");

    Canvas.registerFont(path.join(__dirname, "/../assets/bold-font.ttf"), { family: 'Manrope', weight: "regular", style: "normal" });
    Canvas.registerFont(path.join(__dirname, "/../assets/regular-font.ttf"), { family: 'Manrope', weight: "bold", style: "normal" });

    const canvas = Canvas.createCanvas(934, 282);
    const ctx = canvas.getContext("2d");

    if(!rankCard) rankCard = await Canvas.loadImage(path.join(__dirname, "/../assets/rankcard.png"));
    ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);

    const font = "Manrope";

    ctx.font = `bold 36px ${font}`;
    ctx.fillStyle = "#" + color;
    ctx.textAlign = "start";
    const name = username.length > 9 ? username.substring(0, 8).trim() + '...' : username;
    ctx.fillText(`${name}`, 264, 164);
    ctx.font = `36px ${font}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    if (discrim) ctx.fillText(`#${discrim}`, ctx.measureText(name).width + 10 + 316, 164);

    ctx.font = `bold 36px ${font}`;
    ctx.fillStyle = "#" + color;
    ctx.textAlign = "end";
    ctx.fillText(level, 934 - 64, 82);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("LEVEL", 934 - 64 - ctx.measureText(level).width - 16, 82);

    ctx.font = `bold 36px ${font}`;
    ctx.fillStyle = "#" + color;
    ctx.textAlign = "end";
    ctx.fillText(rank, 934 - 64 - ctx.measureText(level).width - 16 - ctx.measureText(`LEVEL`).width - 16, 82);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("RANK", 934 - 64 - ctx.measureText(level).width - 16 - ctx.measureText(`LEVEL`).width - 16 - ctx.measureText(rank).width - 16, 82);

    ctx.font = `bold 36px ${font}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "start";
    ctx.fillText("/ " + neededXP, 624 + ctx.measureText(currentXP).width + 10, 164);
    ctx.fillStyle = "#" + color;
    ctx.fillText(currentXP, 624, 164);

    let widthXP = (currentXP * 615) / neededXP;
    if (widthXP > 615 - 18.5) widthXP = 615 - 18.5;

    ctx.beginPath();
    ctx.fillStyle = "#424751";
    ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.fill();
    ctx.fillRect(257 + 18.5, 147.5 + 36.25, 615 - 18.5, 37.5);
    ctx.arc(257 + 615, 147.5 + 18.5 + 36.25, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#" + color;
    ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.fill();
    ctx.fillRect(257 + 18.5, 147.5 + 36.25, widthXP, 37.5);
    ctx.arc(257 + 18.5 + widthXP, 147.5 + 18.5 + 36.25, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarURL);
    ctx.arc(160, 141, 150 / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 85, 66, 150, 150);

    return canvas.toBuffer();
}