import Command from '../../utils/command.js';
export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "Morse";
	}
	async run(bot, message, args) {
		if(!args[1]) return message.channel.send("Put something");
		let i;
		let alpha = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
			morse = "/,.-,-...,-.-.,-..,.,..-.,--.,....,..,.---,-.-,.-..,--,-.,---,.--.,--.-,.-.,...,-,..-,...-,.--,-..-,-.--,--..,.----,..---,...--,....-,.....,-....,--...,---..,----.,-----".split(","),
			text = args.slice(1).join(" ").toUpperCase();
		while (text.includes("Ä") || text.includes("Ö") || text.includes("Ü")) {
			text = text.replace("Ä", "AE").replace("Ö", "OE").replace("Ü", "UE");
		}
		if (text.startsWith(".") || text.startsWith("-")) {
			text = text.split(" ");
			let length = text.length;
			for (i = 0; i < length; i++) {
				text[i] = alpha[morse.indexOf(text[i])];
			}
			text = text.join("");
		} else {
			text = text.split("");
			let length = text.length;
			for (i = 0; i < length; i++) {
				text[i] = morse[alpha.indexOf(text[i])];
			}
			text = text.join(" ");
		}
		return message.channel.send("```" + text + "```");
	}
}