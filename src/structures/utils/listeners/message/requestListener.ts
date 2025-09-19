import type { Message, UsingClient } from "seyfert";

/**
 *
 * The listener for the `messageCreate` event of the client.
 * This listener is triggered when a message is sent in a text channel.
 * @param {UsingClient} client The client instance.
 * @param {Message} message The message instance.
 */
export async function requestListener(client: UsingClient, message: Message): Promise<void> {
    if (!message.guildId || message.author.bot) return;

    const data = await client.database.getRequest(message.guildId);
    if (!data) return;

    if (data.channelId !== message.channelId) return;

    const from = await client.messages.fetch(data.messageId, data.channelId).catch(() => null);
    if (!from) return;
}
