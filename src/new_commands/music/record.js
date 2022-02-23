import { MessageAttachment } from 'discord.js';
import { entersState, VoiceConnectionStatus } from '@discordjs/voice';
//eslint-disable-next-line
import { Transform } from 'node:stream';
import opus from '@discordjs/opus';
import lame from 'node-lame';

//Convert Opus to raw PCM, https://github.com/discordjs/voice/issues/210
class OpusDecodingStream extends Transform {
    constructor(options, encoder) {
        super(options)
        this.encoder = encoder
    }
    _transform(data, encoding, callback) {
        this.push(this.encoder.decode(data))
        callback()
    }
}
export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "This will record your voice and put it into a MP3 file.";
        this.deployOptions.options = [{
            name: "private",
            required: true,
            type: "BOOLEAN",
            description: "Do you want this file to be just for you?"
        }];
    }
    async run(bot, interaction) {
        if (interaction.guild.me.voice.channelId) return interaction.reply("It seems like I'm busy playing music...");
        const channelId = interaction.member.voice.channelId;
        if (!channelId) return interaction.reply("You need to be in a voice channel to record your voice!");
        const channel = await interaction.guild.channels.fetch(channelId).catch(() => {});
        if (!channel.joinable || (channel.type !== "GUILD_STAGE_VOICE" && !channel.speakable)) return interaction.reply("I don't have permissions to connect and speak in your channel!");
        await interaction.deferReply();
        const nopublic = interaction.options.getBoolean("private");
        //Using DisTube integration
        const dc = await bot.distube.voices.join(interaction.member.voice.channel || await interaction.guild.channels.fetch(channelId));
        dc.setSelfDeaf(false);
        await entersState(dc.connection, VoiceConnectionStatus.Ready, 20e3);
        //Silence frames
        dc.connection.playOpusPacket(Buffer.from([0xf8, 0xff, 0xfe]));
        //Start receiving voice packets
        const pre_stream = dc.connection.receiver.subscribe(interaction.user.id, { end: { behavior: 1, duration: 15000 } });
        //For global use across the bot
        bot.records.set(interaction.guild.id, { user_id: interaction.user.id, stream: new OpusDecodingStream({}, new opus.OpusEncoder(48000, 2)) });
        const { stream } = bot.records.get(interaction.guild.id);
        pre_stream.pipe(stream);

        //Stream chunks
        const chunks = [];
        stream.on('data', (c) => chunks.push(c));

        //When stream destroyed, send converted MP3 audio to user
        stream.on('close', () => {
            const pcm = Buffer.concat(chunks);
            const encoder = new lame.Lame({
                "output": "buffer",
                "bitrate": 192,
                raw: true,
                sfreq: 48,
                bitwidth: 16,
                "little-endian": true,
            }).setBuffer(pcm);
            //Convert to MP3
            encoder.encode()
                .then(async () => {
                    // Encoding finished
                    const mp3 = encoder.getBuffer();
                    const att = new MessageAttachment(mp3, "record.mp3");
                    const channel = interaction.member.voice.channel || await interaction.guild.channels.fetch(channelId).catch(() => { });
                    if (channel) await bot.distube.voices.leave(channel);
                    if (nopublic) {
                        await interaction.editReply("Recording done :)");
                        await interaction.followUp({ ephemeral: true, content: "Here's your recording:", files: [att] });
                    }
                    else await interaction.editReply({ content: "Here's your recording:", files: [att] });
                    bot.records.delete(interaction.guild.id);
                })
                .catch((error) => {
                    interaction.editReply(error.toString());
                });
        });
        await interaction.editReply("Start talking. Use the /stoprecord command to stop recording.\nRecording will auto-stop when you (or I) leave the voice channel or when there is no activity for 15 seconds.");
        dc.connection.receiver.speaking.once("start", (user_id) => {
            if (user_id === interaction.user.id) interaction.editReply("Recording...");
        });
    }
}