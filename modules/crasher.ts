import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { Cheats, punish } from "./punish";

const CRASH_VALUE = 2147483647;

events.packetBefore(MinecraftPacketIds.PlayerAuthInput).on((pk, ni) => {
    if (
        pk.moveX >= CRASH_VALUE ||
        pk.moveZ >= CRASH_VALUE ||
        pk.pos.x >= CRASH_VALUE ||
        pk.pos.y >= CRASH_VALUE ||
        pk.pos.z >= CRASH_VALUE
    ) {
        punish(ni, Cheats.Crasher);
        return CANCEL;
    }
});
