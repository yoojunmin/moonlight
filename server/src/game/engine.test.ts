import {describe,it,expect} from 'vitest';
import {BOARD,CONFIG,type Player,type Room} from '../../../shared/src/types.js';
import {command,createGame} from './engine.js';
const players:Player[]=['a','b'].map((id,i)=>({id,name:id,color:CONFIG.colors[i],position:0,cash:CONFIG.startingCash,ready:true,connected:true,bankrupt:false,token:id.repeat(30)}));
const room=():Room=>({code:'ABCDE',host:'a',players:structuredClone(players),game:createGame(players,90),settings:{turnSeconds:90},created:0});
describe('authoritative board rules',()=>{
 it('rejects another player and invalid phase commands',()=>{const r=room();expect(()=>command(r,r.players[1],'roll')).toThrow('NOT_YOUR_TURN');command(r,r.players[0],'roll');expect(()=>command(r,r.players[0],'roll')).toThrow('INVALID_PHASE')});
 it('awards the bonus when movement lands exactly on start',()=>{const r=room();const g=r.game!;g.players[0].position=BOARD.length-2;const before=g.players[0].cash;const random=Math.random;Math.random=()=>0;try{command(r,r.players[0],'roll')}finally{Math.random=random}expect(g.players[0].cash).toBe(before+CONFIG.startBonus)});
 it('validates buying and transfers a landing toll',()=>{const r=room();const g=r.game!;let id=BOARD.find(t=>t.type==='property')!.id;g.players[0].position=id-1;g.dice=[1,1];g.phase='choose_action';g.pending=String(id);command(r,r.players[0],'buy');expect(g.properties[id].owner).toBe('a');expect(()=>command(r,r.players[1],'buy')).toThrow('NOT_YOUR_TURN')});
 it('requires a complete set and even building',()=>{const r=room();const g=r.game!;let set=BOARD.filter(t=>t.group==='초록');for(const t of set)g.properties[t.id].owner='a';g.players[0].position=set[0].id;g.phase='end_turn';command(r,r.players[0],'build');expect(g.properties[set[0].id].buildings).toBe(1);expect(()=>command(r,r.players[0],'build')).toThrow('BUILD_EVENLY')});
});
