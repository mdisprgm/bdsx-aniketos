import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { Packet } from "bdsx/bds/packet";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { LevelChunkPacket, LoginPacket, PlayerAuthInputPacket } from "bdsx/bds/packets";
import { PlayerPermission, ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import { Event } from "bdsx/eventtarget";
import { bedrockServer } from "bdsx/launcher";
import { bool_t, uint8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

export namespace Utils {
    export type ReturnPromise<T extends (...args: any[]) => Event.ReturnType> = T extends (...args: infer ARGS) => infer RET
        ? (...args: ARGS) => RET | Promise<void>
        : never;

    export function crashClient(ni: NetworkIdentifier) {
        let pk = LevelChunkPacket.allocate();
        pk.cacheEnabled = true;
        pk.sendTo(ni);
        pk.dispose();
    }
    export function getCurrentTick(): number {
        return bedrockServer.level.getCurrentTick();
    }
    export function getOnlineOperators(): ServerPlayer[] {
        return bedrockServer.serverInstance.getPlayers().filter(p => p.getPermissionLevel() === PlayerPermission.OPERATOR);
    }
    export function isCreativeLikeModes(player: ServerPlayer) {
        const mode = player.getGameType();
        return mode === 1 || mode === 4;
    }
    export function broadcastPacket(pk: Packet) {
        for (const player of bedrockServer.serverInstance.getPlayers()) {
            player.sendPacket(pk);
        }
    }
    export function getPing(ni: NetworkIdentifier) {
        if (ni.toString().split("|")[0] === "127.0.0.1") {
            return bedrockServer.rakPeer.GetLastPing(ni.address) - 30;
        }
        return bedrockServer.rakPeer.GetLastPing(ni.address);
    }
    export function formatString(str: string,  params:string[] = []) {
        if (params.length === 0) {
            return str;
        }
        const escaped = str.split("%%");
        const ret: string[] = [];
        for (let s of escaped) {
            // Matches %s
            s = s.replace(/%s/g, m => {
                const param = params.shift();
                if (param === undefined) {
                    return "%s";
                }
                return param;
            });
            // Matches %1 and %1$s
            s = s.replace(/%\d+(\$s)?/g, m => {
                const index = parseInt(m.match(/\d+/)![0]) - 1;
                const p = params[index];
                if (p === undefined) {
                    return "";
                }
                return p;
            });
            ret.push(s);
        }
        return ret.join("%");
    }
    export const getAuthInputData = procHacker.js("?getInput@PlayerAuthInputPacket@@QEBA_NW4InputData@1@@Z", bool_t, null, PlayerAuthInputPacket, uint8_t);
    export class PlayerDB {
        private db = new Map<NetworkIdentifier, Record<string, any>>();
        constructor() {
            const loginHandler = (pk: LoginPacket, ni: NetworkIdentifier) => {
                const connreq = pk.connreq;
                if (connreq) {
                    const cert = connreq.cert;
                    const data = connreq.getJsonValue()!;
                    this.db.set(ni, {
                        address: ni.toString().split(":")[0],
                        gamertag: cert.getIdentityName(),
                        uuid: cert.getIdentityString(),
                        xuid: cert.getXuid(),
                        titleId: cert.json.value()["extraData"]["titleId"],
                    });
                    this.setPlayerData(ni, data["DeviceOS"], "DeviceOS");
                }
            }
            events.packetAfter(MinecraftPacketIds.Login).on(loginHandler);
            events.serverStop.on(() => {
                events.packetAfter(MinecraftPacketIds.Login).remove(loginHandler);
            });
            events.networkDisconnected.on(ni => {
                this.db.delete(ni);
            });
        }
        getPlayerData(ni: NetworkIdentifier): Record<string, any> | null;
        getPlayerData(ni: NetworkIdentifier, field: string): any | null;
        getPlayerData(ni: NetworkIdentifier, field?: string) {
            if (this.db.has(ni)) {
                const data = this.db.get(ni)!;
                if (field) {
                    return data[field];
                }
                return data;
            }
            return null;
        }
        setPlayerData(ni: NetworkIdentifier, value: Record<string, any>): void;
        setPlayerData(ni: NetworkIdentifier, value: any, field: string): void;
        setPlayerData(ni: NetworkIdentifier, value: any, field?: string) {
            if (this.db.has(ni)) {
                const data = this.db.get(ni)!;
                if (field) {
                    data[field] = value;
                } else {
                    Object.assign(data, value);
                }
            }
        }

        address(ni: NetworkIdentifier): string {
            return this.getPlayerData(ni, "address") ?? "Unknown";
        }
        gamertag(ni: NetworkIdentifier): string {
            return this.getPlayerData(ni, "gamertag") ?? "Unknown";
        }
        uuid(ni: NetworkIdentifier): string {
            return this.getPlayerData(ni, "uuid") ?? "Unknown";
        }
        xuid(ni: NetworkIdentifier): string {
            return this.getPlayerData(ni, "xuid") ?? "Unknown";
        }
        titleId(ni: NetworkIdentifier): string {
            return this.getPlayerData(ni, "titleId") ?? "Unknown";
        }
    }
}

export const DB = new Utils.PlayerDB;