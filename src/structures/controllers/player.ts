import type { SearchPlatform } from "lavalink-client";
import type { UsingClient } from "seyfert";
import { Controller } from "#stelle/classes/Controller.js";
import type { StelleDatabase } from "#stelle/classes/Database.js";
import { CacheKeys } from "#stelle/types";

/**
 * The interface of the guild player.
 */
interface StoredPlayer {
    /**
     * The default volume of the player.
     * @type {number}
     */
    defaultVolume: number;
    /**
     * The search platform of the player.
     * @type {SearchPlatform}
     */
    searchPlatform: SearchPlatform;
}

/**
 * Class representing the player controller.
 * @class PlayerController
 * @extends Controller<"guildPlayer">
 */
export class PlayerController extends Controller<"guildPlayer"> {
    readonly modelName = "guildPlayer";

    /**
     * The client instance for config access.
     * @type {UsingClient}
     * @readonly
     * @private
     */
    private readonly client: UsingClient;

    /**
     * Create a player controller instance.
     * @param {StelleDatabase} database The database instance.
     */
    constructor(database: StelleDatabase) {
        super(database);
        this.client = database.client;
    }

    /**
     *
     * Get the guild player from the database.
     * @param {string} id The guild id.
     * @returns {Promise<StoredPlayer>} The player data of the guild.
     */
    public async get(id: string): Promise<StoredPlayer> {
        const cache = this.cache.get(CacheKeys.Player, id);
        if (cache?.defaultVolume && cache?.searchPlatform)
            return {
                defaultVolume: cache.defaultVolume,
                searchPlatform: cache.searchPlatform as SearchPlatform,
            };

        const data = await this.model.findUnique({ where: { id } });
        return {
            defaultVolume: data?.defaultVolume ?? this.client.config.defaultVolume,
            searchPlatform: (data?.searchPlatform as SearchPlatform | null | undefined) ?? this.client.config.defaultSearchPlatform,
        };
    }

    /**
     *
     * Set the guild player to the database.
     * @param {string} id The guild id.
     * @param {Partial<StoredPlayer>} player The player data to set.
     * @returns {Promise<void>} A promise that resolves when the player is set.
     */
    public async set(id: string, player: Partial<StoredPlayer>): Promise<void> {
        await this.model
            .upsert({
                where: { id },
                update: player,
                create: {
                    id,
                    ...player,
                },
            })
            .then(({ id, ...rest }) => this.cache.set(CacheKeys.Player, id, rest));
    }
}
