import { hex } from "bdsx/util";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
import { cheats, punish } from "./punish";
import { CANCEL } from "bdsx/common";
import { DEBUG } from "./debug";

events.packetRaw(MinecraftPacketIds.InventoryTransaction).on((ptr, size, ni) => {
    let data = hex(ptr.readBuffer(size));
    if (data.slice(9, 23) === "02 9F 8D 06 09" || data.slice(21, 35) === "02 9F 8D 06 09") {
        if (DEBUG) console.log(data);
        punish(ni, cheats.Give);
        return CANCEL;
    }
});

/* legit
    1E 07 01 1C 01 03 02 01 00 00 03 89 05 40 00 00 00 DA 02 0A 00 00 00 00 00 00 00 00 00 00 89 05 3F 00 00 00 DA 02 0A 00 00 00 00 00 00 00 00 00 00 00 EA 02 3E 92 01 02 06 89 05 40 00 00 00 DA 02 0A 00 00 00 00 00 00 00 00 00 00 8A D5 33 43 72 3D 81 42 0A 4A 96 42 00 02 68 3F 00 00 80 3F 00 FE 3E 3F FF 32
   */

/* toolbox
    1E 07 01 1C 01 01 00 02 9F 8D 06 09 00 E2 03 40 00 00 00 80 6B 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 E2 03 40 00 00 00 80 6B 0A 00 00 00 00 00 00 00 00 00 00
    1E 0B 01 1C 01 01 00 02 9F 8D 06 09 00 05 40 00 00 00 A4 3E 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 05 40 00 00 00 A4 3E 0A 00 00 00 00 00 00 00 00 00 00
    1E 0F 01 1C 01 01 00 02 9F 8D 06 09 00 D6 02 40 00 00 00 B6 0E 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 D6 02 40 00 00 00 B6 0E 0A 00 00 00 00 00 00 00 00 00 00
    1E 13 01 1C 01 01 00 02 9F 8D 06 09 00 80 05 01 00 00 00 00 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 80 05 01 00 00 00 00 0A 00 00 00 00 00 00 00 00 00 00
    1E 07 01 1C 01 01 00 02 9F 8D 06 09 00 9F 05 40 00 00 00 D0 67 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 9F 05 40 00 00 00 D0 67 0A 00 00 00 00 00 00 00 00 00 00
*/

/* horion
    1E 00 00 02 9F 8D 06 09 00 82 04 01 00 00 00 00 00 00 00 00 0A 00 82 04 01 00 00 00 00 00
    1E 00 00 02 9F 8D 06 09 00 E0 04 01 00 00 00 00 00 00 00 00 0D 00 E0 04 01 00 00 00 00 00
    1E 00 00 02 9F 8D 06 09 00 80 05 01 00 00 00 00 00 00 00 00 09 00 80 05 01 00 00 00 00 00
    1E 00 00 02 9F 8D 06 09 00 EC 09 01 00 00 00 00 00 00 00 00 0E 00 EC 09 01 00 00 00 00 00
    1E 00 00 02 9F 8D 06 09 00 80 05 40 00 00 00 00 00 00 00 00 0F 00 80 05 40 00 00 00 00 00
*/