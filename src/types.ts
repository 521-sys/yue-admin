export type Page<T>={items:T[];total:number;page:number;pageSize:number};
export type Line={speaker:'A'|'B';cantoneseText:string;mandarinText:string;jyutping?:string;audioKey?:string};
export type Scene={id?:number;code:string;title:string;place:string;emoji:string;roleA:string;roleB:string;category:string;difficulty:string;sortOrder:number;version:number;status:string;builtin:boolean};
export type Detail={scene:Scene;lines:Line[]};
export type AudioItem={id:string;name:string;audioKey:string;url:string;size:number;contentType:string;referenceCount:number;readOnly:boolean;version:number};
export const statusText:Record<string,string>={DRAFT:'草稿',PUBLISHED:'已发布',OFFLINE:'已下架'};
