import {
    Command,
    createChannelOption,
    Declare,
    Embed,
    type GuildCommandContext,
    LocalesT,
    type Message,
    Options,
    type WebhookMessage,
} from "seyfert";
import { EmbedColors } from "seyfert/lib/common/index.js";
import { ChannelType } from "seyfert/lib/types/index.js";
import { StelleCategory } from "#stelle/types";
import { StelleOptions } from "#stelle/utils/decorator.js";

const options = {
    channel: createChannelOption({
        description: "Enter the new channel.",
        channel_types: [ChannelType.GuildText],
        locales: {
            name: "locales.setchannel.option.name",
            description: "locales.setchannel.option.description",
        },
    }),
};

@Declare({
    name: "setchannel",
    description: "Set the requests channel of Stelle.",
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
    defaultMemberPermissions: ["ManageGuild"],
})
@StelleOptions({ cooldown: 10, category: StelleCategory.Guild })
@LocalesT("locales.setchannel.name", "locales.setchannel.description")
@Options(options)
export default class SetChannelCommand extends Command {
    public override async run(ctx: GuildCommandContext<typeof options>): Promise<WebhookMessage | Message | void> {
        const { client, options } = ctx;

        await ctx.deferReply(true);

        const { messages } = await ctx.getLocale();

        const channel = options.channel ?? (await ctx.channel().catch(() => null));
        if (!channel)
            return ctx.editOrReply({
                content: "",
                embeds: [{ description: messages.commands.setchannel.noChannel, color: EmbedColors.Red }],
            });

        if (!channel.isTextGuild())
            return ctx.editOrReply({
                content: "",
                embeds: [{ description: messages.commands.setchannel.noTextChannel, color: EmbedColors.Red }],
            });
        if (channel.guildId !== ctx.guildId)
            return ctx.editOrReply({
                content: "",
                embeds: [{ description: messages.commands.setchannel.noSameGuild, color: EmbedColors.Red }],
            });

        const embed = new Embed();

        const message = await channel.messages.write({ embeds: [embed] });

        await client.database.setRequest(ctx.guildId, { channelId: channel.id, messageId: message.id });
    }
}
