import {z} from 'zod';
export const nameSchema=z.string().trim().min(1).max(16).regex(/^[^<>]+$/);
export const codeSchema=z.string().regex(/^[A-Z0-9]{5}$/);
export const commandSchema=z.object({requestId:z.string().min(8).max(80),token:z.string().min(20).max(100)});
export const joinSchema=commandSchema.extend({code:codeSchema,name:nameSchema});
export const roomCodeSchema=commandSchema.extend({code:codeSchema});
export const actionSchema=commandSchema.extend({action:z.enum(['roll','buy','decline','build','end','surrender']),tileId:z.number().int().min(0).max(31).optional()});
