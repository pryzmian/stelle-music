import type { PlayerJson } from "lavalink-client";
import type { ClientUser } from "seyfert";
import type { PermissionFlagsBits } from "seyfert/lib/types/index.js";

export type { StelleConfiguration } from "./client/StelleConfiguration.js";
export type { AllEvents, LavalinkEvent, LavalinkEventRun, LavalinkEventType } from "./client/StelleLavalink.js";

export type PermissionNames = keyof typeof PermissionFlagsBits;
export type AutoplayMode = "enabled" | "disabled";
export type PausedMode = "pause" | "resume";
export type NonCommandOptions = Omit<Options, "category">;

export type StellePlayerJson = Omit<
    PlayerJson,
    "ping" | "createdTimeStamp" | "lavalinkVolume" | "equalizer" | "lastPositionChange" | "paused" | "playing"
> & {
    messageId?: string;
    enabledAutoplay?: boolean;
    me?: ClientUser;
    localeString?: string;
};
export interface Options {
    /** The cooldown. */
    cooldown?: number;
    /** Only the bot developer can use the command. */
    onlyDeveloper?: boolean;
    /** Only the guild owner cam use the command. */
    onlyGuildOwner?: boolean;
    /** Only a member in a voice channel can use the command. */
    inVoice?: boolean;
    /** Only a member on the same voice channel with Stelle will be able to use the command. */
    sameVoice?: boolean;
    /** Check if Stelle is connected atleast in one node. */
    checkNodes?: boolean;
    /** Check if a player exists in a guild. */
    checkPlayer?: boolean;
    /** Check if the player queue has more than one track. */
    checkQueue?: boolean;
    /** Check if the queue has two or more tracks. */
    moreTracks?: boolean;
    /** The command category. */
    category?: StelleCategory;
}

export enum StelleKeys {
    Player = "guild:player",
    Locale = "guild:locale",
    Prefix = "guild:prefix",
}

export enum StelleCategory {
    Unknown = 0,
    User = 1,
    Guild = 2,
    Music = 3,
}
