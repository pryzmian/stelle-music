import { AutoLoad, Command, Declare, LocalesT } from "seyfert";
import { StelleOptions } from "#stelle/decorators";
import { StelleCategory } from "#stelle/types";

@Declare({
    name: "info",
    description: "Get the info about the bot or a user.",
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
@AutoLoad()
@LocalesT("locales.info.name", "locales.info.description")
@StelleOptions({ category: StelleCategory.User, cooldown: 5 })
export default class InfoCommand extends Command {}
