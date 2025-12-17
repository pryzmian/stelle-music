import type { UsingClient } from "seyfert";
import { Controller } from "#stelle/classes/Controller.js";
import type { StelleDatabase } from "#stelle/classes/Database.js";
import { CacheKeys } from "#stelle/types";

/**
 * Class representing the prefix controller.
 * @class PrefixController
 * @extends Controller<"guildPrefix">
 */
export class PrefixController extends Controller<"guildPrefix"> {
    readonly modelName = "guildPrefix";

    /**
     * The client instance for config access.
     * @type {UsingClient}
     * @readonly
     * @private
     */
    private readonly client: UsingClient;

    /**
     * Create a prefix controller instance.
     * @param {StelleDatabase} database The database instance.
     */
    constructor(database: StelleDatabase) {
        super(database);
        this.client = database.client;
    }

    /**
     * Get the prefix for a guild.
     * @param {string} id The id of the guild.
     * @returns {Promise<string>} The prefix for the guild.
     */
    public async get(id: string): Promise<string> {
        const cached = this.cache.get(CacheKeys.Prefix, id);
        if (cached?.prefix) return cached.prefix;

        const data = await this.model.findUnique({ where: { id } });
        if (data?.prefix) return data.prefix;

        return this.client.config.defaultPrefix;
    }

    /**
     * Set the prefix for a guild.
     * @param {string} id The id of the guild.
     * @param {string} prefix The prefix to set.
     * @returns {Promise<void>} A promise that resolves when the prefix is set.
     */
    public async set(id: string, prefix: string): Promise<void> {
        await this.model
            .upsert({
                where: { id },
                create: { id, prefix },
                update: { prefix },
            })
            .then(({ id, ...rest }) => this.cache.set(CacheKeys.Prefix, id, rest));
    }
}
