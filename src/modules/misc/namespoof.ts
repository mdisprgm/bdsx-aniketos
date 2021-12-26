import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { DeviceOS } from "bdsx/common";
import { events } from "bdsx/event";
import { DB } from "../../utils";
import { ModuleBase, ModuleConfig } from "../base";

export default class Namespoof extends ModuleBase {
    configModel = class Config extends ModuleConfig {
        "punish" = false;
    };
    langModel = () => {
    /*
        name=Namespoof
        description=Checks if the names of players are fake.

        suspect.overriden=Gamertag is overriden, [%1] => [%2].

        punish.generic=Use your real gamertag.
    */};
    
    load(): void {
        this.listen(events.packetSend(MinecraftPacketIds.PlayStatus), (pk, ni) => {
            if (pk.status === 3 && DB.getPlayerData(ni, "DeviceOS") !== DeviceOS.PLAYSTATION) {
                const gamertag = DB.gamertag(ni);
                const player = ni.getActor()!;
                const name = player.getName();
                if (name !== gamertag) {
                    this.suspect(ni, this.translate("suspect.overriden", [gamertag, name]));
                    if (this.getConfig().punish) {
                        this.punish(ni, this.translate("punish.generic"));
                    } else {
                        player.setName(gamertag);
                    }
                }
            }
        });
    }
    unload(): void {
    }
}