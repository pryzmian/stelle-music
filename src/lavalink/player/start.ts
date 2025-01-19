import { ActionRow, Button, Embed, type User } from "seyfert";
import { Lavalink } from "#stelle/classes";

import { ButtonStyle } from "seyfert/lib/types/index.js";

import { TimeFormat } from "#stelle/utils/Time.js";
import { getAutoplayState, getPauseState } from "#stelle/utils/functions/utils.js";

export default new Lavalink({
    name: "trackStart",
    type: "manager",
    async run(client, player, track): Promise<void> {
        if (!(player.textChannelId && player.voiceChannelId)) return;
        if (!track) return;

        const isAutoplay = player.get<boolean | undefined>("enabledAutoplay") ?? false;

        const locale = player.get<string | undefined>("localeString");
        if (!locale) return;

        const voice = await client.channels.fetch(player.voiceChannelId);
        if (!voice.is(["GuildStageVoice", "GuildVoice"])) return;

        const { messages } = client.t(locale).get();

        const duration = track.info.isStream
            ? messages.commands.play.live
            : (TimeFormat.toDotted(track.info.duration) ?? messages.commands.play.undetermined);

        const embed = new Embed()
            .setDescription(
                messages.events.trackStart.embed({
                    duration,
                    requester: (track.requester as User).id,
                    title: track.info.title,
                    url: track.info.uri,
                    volume: player.volume,
                    author: track.info.author,
                    size: player.queue.tracks.length,
                }),
            )
            .setThumbnail(track.info.artworkUrl ?? undefined)
            .setColor(client.config.color.extra)
            .setTimestamp();

        const row = new ActionRow<Button>().addComponents(
            new Button().setCustomId("player-stopPlayer").setStyle(ButtonStyle.Danger).setLabel(messages.events.trackStart.components.stop),
            new Button()
                .setCustomId("player-skipTrack")
                .setStyle(ButtonStyle.Secondary)
                .setLabel(messages.events.trackStart.components.skip),
            new Button()
                .setCustomId("player-previousTrack")
                .setStyle(ButtonStyle.Secondary)
                .setLabel(messages.events.trackStart.components.previous),
            new Button()
                .setCustomId("player-lyricsShow")
                .setStyle(ButtonStyle.Secondary)
                .setLabel(messages.events.trackStart.components.lyrics),
            new Button()
                .setCustomId("player-guildQueue")
                .setStyle(ButtonStyle.Primary)
                .setLabel(messages.events.trackStart.components.queue),
        );

        const newRow = new ActionRow<Button>().addComponents(
            new Button()
                .setCustomId("player-toggleAutoplay")
                .setStyle(ButtonStyle.Primary)
                .setLabel(
                    messages.events.trackStart.components.autoplay({
                        type: messages.commands.autoplay.autoplayType[getAutoplayState(isAutoplay)],
                    }),
                ),
            new Button()
                .setCustomId("player-toggleLoop")
                .setStyle(ButtonStyle.Secondary)
                .setLabel(
                    messages.events.trackStart.components.loop({
                        type: messages.commands.loop.loopType[player.repeatMode],
                    }),
                ),
            new Button()
                .setCustomId("player-pauseTrack")
                .setStyle(ButtonStyle.Primary)
                .setLabel(messages.events.trackStart.components.paused[getPauseState(player.paused)]),
        );

        if (voice.is(["GuildVoice"]))
            await voice
                .setVoiceStatus(
                    messages.events.voiceStatus.trackStart({
                        author: track.info.author,
                        title: track.info.title,
                    }),
                )
                .catch(() => null);

        const message = await client.messages.write(player.textChannelId, { embeds: [embed], components: [row, newRow] }).catch(() => null);
        if (message) {
            player.set("messageId", message.id);

            if (player.get("lyricsId")) {
                const lyrics = await player.node.lyrics.getCurrent(player.guildId).catch(() => null);
                if (!lyrics) return;

                const author = await client.users.fetch((track.requester as User).id).catch(() => null);
                if (!author) return;

                player.set("lyrics", lyrics);

                const lines = lyrics.lines
                    .slice(0, 11)
                    .map((l, i) => (i === 0 ? `**${l.line}**` : `-# ${l.line}`))
                    .join("\n");
                const embed = new Embed()
                    .setThumbnail(track.info.artworkUrl ?? undefined)
                    .setColor(client.config.color.extra)
                    .setTitle(messages.commands.lyrics.embed.title({ title: track.info.title }))
                    .setFooter({
                        iconUrl: author.avatarURL(),
                        text: messages.commands.lyrics.embed.footer({ userName: author.tag }),
                    })
                    .setDescription(
                        messages.commands.lyrics.embed.description({
                            lines,
                            provider: lyrics.provider,
                        }),
                    );

                const row = new ActionRow<Button>().addComponents(
                    new Button().setCustomId("player-lyricsClose").setLabel(messages.commands.lyrics.close).setStyle(ButtonStyle.Secondary),
                );

                const response = await message.reply({ embeds: [embed], components: [row] }).catch(() => null);
                if (response) player.set("lyricsId", response.id);
            }
        }
    },
});
