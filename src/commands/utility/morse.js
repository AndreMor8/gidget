export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "Morse";
	}
	async run(bot, message, args) {
		if(!args[1]) return message.channel.send("Put something...");
		let i;
		const alpha = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
			morse = "/,.-,-...,-.-.,-..,.,..-.,--.,....,..,.---,-.-,.-..,--,-.,---,.--.,--.-,.-.,...,-,..-,...-,.--,-..-,-.--,--..,.----,..---,...--,....-,.....,-....,--...,---..,----.,-----".split(",");
		let text = args.slice(1).join(" ").toUpperCase();
		while (text.includes("Ä") || text.includes("Ö") || text.includes("Ü")) {
			text = text.replace("Ä", "AE").replace("Ö", "OE").replace("Ü", "UE");
		}
		if (text.startsWith(".") || text.startsWith("-")) {
			text = text.split(" ");
			const length = text.length;
			for (i = 0; i < length; i++) {
				text[i] = alpha[morse.indexOf(text[i])];
			}
			text = text.join("");
		} else {
			text = text.split("");
			const length = text.length;
			for (i = 0; i < length; i++) {
				text[i] = morse[alpha.indexOf(text[i])];
			}
			text = text.join(" ");
		}
		await message.channel.send("```" + text + "```");
	}
}