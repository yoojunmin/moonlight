import type {Room,Player} from '../../../shared/src/types.js';
export interface RoomRepository {get(code:string):Room|undefined;set(room:Room):void;delete(code:string):void;values():IterableIterator<Room>}
export class MemoryRoomRepository implements RoomRepository {private rooms=new Map<string,Room>();get(code:string){return this.rooms.get(code)}set(room:Room){this.rooms.set(room.code,room)}delete(code:string){this.rooms.delete(code)}values(){return this.rooms.values()}}
export function publicRoom(room:Room){const clean=(p:Player)=>{const {token,...rest}=p;return rest};let game=room.game?{...room.game,players:room.game.players.map(clean)}:null;return {code:room.code,host:room.host,players:room.players.map(clean),game,settings:room.settings}}

