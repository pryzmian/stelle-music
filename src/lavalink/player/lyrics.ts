import type { LyricsResult } from "lavalink-client";
import { Lavalink } from "#stelle/classes";

export default new Lavalink({
    name: "LyricsLine",
    type: "manager",
    async run(client, player, _, payload): Promise<void> {
        if (!player.textChannelId) return;

        const lyricsId = player.get<string | undefined>("lyricsId");
        if (!lyricsId) return;

        const message = await client.messages.fetch(lyricsId, player.textChannelId);

        const embed = message.embeds.at(0)?.toBuilder();
        if (!embed) return;

        const lyrics = player.get<LyricsResult | undefined>("lyrics");
        if (!lyrics) return;

        const locale = player.get<string | undefined>("localeString");
        if (!locale) return;

        const { messages } = client.t(locale).get(locale);

        const index = payload.lineIndex;
        const start = Math.max(0, index - 5);
        const end = Math.min(lyrics.lines.length, start + 11);

        const lines = lyrics.lines
            .slice(start, end)
            .filter((l) => l.line.length > 0)
            .map((l, i) => (i + start === index ? `**${l.line}**` : `-# ${l.line}`))
            .join("\n");

        embed.setDescription(
            messages.commands.lyrics.embed.description({
                lines,
                provider: lyrics.provider,
            }),
        );

        await message.edit({ embeds: [embed] });
    },
});
