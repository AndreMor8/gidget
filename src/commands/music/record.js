/*import { joinVoiceChannel, createVoiceReceiver, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import a from '@discordjs/opus';
import lame from 'node-lame';
import { MessageAttachment } from 'discord.js';
import { SILENCE_FRAME } from '@discordjs/voice/dist/audio/AudioPlayer.js'*/
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "record your voice";
    }
    async run(/*bot, message, args*/) {
        /*const channel = message.member.voice.channelId;
        if (!channel) return message.reply("you must join a voice channel");
        const connection = joinVoiceChannel({ channelId: channel, guildId: channel.guild.id, adapterCreator: message.guild.voiceAdapterCreator, selfDeaf: false });
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        connection.playOpusPacket(SILENCE_FRAME);
        const receiver = createVoiceReceiver(connection);
        const stream = receiver.subscribe(message.author.id);
        const chunks = [];
        stream.on('data', (c) => chunks.push(c));
        stream.on('end', () => {
            console.log("AAAAA");
            const buf = Buffer.from(chunks);
            const opusEncoder = new a.OpusEncoder(48000, 2);
            const pcm = opusEncoder.decode(buf);
            const encoder = new lame.Lame({
                "output": "buffer",
                "bitrate": 192,
                raw: true,
                sfreq: 48,
                bitwidth: 8,
                unsigned: true,
                "little-endian": true,
            }).setBuffer(pcm);
            encoder.encode()
                .then(() => {
                    // Encoding finished
                    const mp3 = encoder.getBuffer();
                    const att = new MessageAttachment(mp3, "record.mp3");
                    message.channel.send(att);
                })
                .catch((error) => {
                    console.error(error);
                });
        });
        setTimeout(() => stream.destroy(), 10000);*/

    }
}