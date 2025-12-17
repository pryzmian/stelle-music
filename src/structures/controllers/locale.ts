import type { UsingClient } from "seyfert";
import type { LocaleString } from "seyfert/lib/types/index.js";
import { Controller } from "#stelle/classes/Controller.js";
import type { StelleDatabase } from "#stelle/classes/Database.js";
import { CacheKeys } from "#stelle/types";

/**
 * Class representing the locale controller.
 * @class LocaleController
 * @extends Controller<"guildLocale">
 */
export class LocaleController extends Controller<"guildLocale"> {
    readonly modelName = "guildLocale";

    /**
     * The client instance for config access.
     * @type {UsingClient}
     * @readonly
     * @private
     */
    private readonly client: UsingClient;

    /**
     * Create a locale controller instance.
     * @param {StelleDatabase} database The database instance.
     */
    constructor(database: StelleDatabase) {
        super(database);
        this.client = database.client;
    }

    /**
     *
     * Get the locale for a guild.
     * @param {string} id The guild id to get the locale for.
     * @returns {Promise<LocaleString>} A promise that resolves to the locale string.
     */
    public async get(id: string): Promise<LocaleString> {
        const cached = this.cache.get(CacheKeys.Locale, id);
        if (cached?.locale) return cached.locale as LocaleString;

        const data = await this.model.findUnique({ where: { id } });
        if (data?.locale) return data.locale as LocaleString;

        return this.client.config.defaultLocale;
    }

    /**
     *
     * Update the locale for a guild.
     * @param {string} id The guild id to update the locale for.
     * @param {string} locale The new locale to set for the guild.
     * @returns {Promise<void>} A promise that resolves when the locale is updated.
     */
    public async update(id: string, locale: string): Promise<void> {
        await this.model
            .upsert({
                where: { id },
                create: { id, locale },
                update: { locale },
            })
            .then(({ id, ...rest }) => this.cache.set(CacheKeys.Locale, id, rest));
    }
}
