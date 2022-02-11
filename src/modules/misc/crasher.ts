import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { ModuleBase, ModuleConfig } from "../base";

const UINT32_MAX = 0xFFFFFFFF;
const CRASHER_TRIGGER = 0x7FFFFFFF;

export default class Crasher extends ModuleBase {
    configModel = class Config extends ModuleConfig {
        "punish" = false;
    };
    langModel = () => {
    /*
        name=Crasher
        description=Blocks bad movement packets that crash the server.

        suspect.invalidCoordinates=Bad movement packet with invalid coordinates.

        punish.generic=Crasher is detected.
    */};

    load(): void {
        this.listen(events.packetBefore(MinecraftPacketIds.PlayerAuthInput), (pk, ni) => {
            if ((pk.moveX > CRASHER_TRIGGER && pk.moveZ > CRASHER_TRIGGER) || (pk.pos.x > CRASHER_TRIGGER && pk.pos.y > CRASHER_TRIGGER&& pk.pos.z > CRASHER_TRIGGER)) {
                this.suspect(ni, this.translate("suspect.invalidCoordinates"));
                if (this.getConfig().punish) {
                    this.punish(ni, this.translate("punish.generic"));
                }
                return CANCEL;
            }
        });
        this.listen(events.packetBefore(MinecraftPacketIds.MovePlayer), (pk, ni) => {
            if ((pk.pos.x > UINT32_MAX && pk.pos.y > UINT32_MAX&& pk.pos.z > UINT32_MAX)) {
                this.suspect(ni, this.translate("suspect.invalidCoordinates"));
                if (this.getConfig().punish) {
                    this.punish(ni, this.translate("punish.generic"));
                }
                return CANCEL;
            }
        });
    }
    unload(): void {
    }
}