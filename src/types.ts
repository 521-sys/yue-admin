export type Page<T>={items:T[];total:number;page:number;pageSize:number};
export type Line={speaker:'A'|'B';cantoneseText:string;mandarinText:string;jyutping?:string;audioKey?:string};
export type Scene={id?:number;code:string;title:string;place:string;emoji:string;roleA:string;roleB:string;category:string;difficulty:string;sortOrder:number;version:number;status:string;builtin:boolean};
export type Detail={scene:Scene;lines:Line[]};
export type AudioItem={id:string;name:string;audioKey:string;url:string;size:number;contentType:string;referenceCount:number;readOnly:boolean;version:number};
export const statusText:Record<string,string>={DRAFT:'草稿',PUBLISHED:'已发布',OFFLINE:'已下架'};
export const actionText:Record<string,string>={CREATE:'新建',UPDATE:'编辑',PUBLISHED:'发布',OFFLINE:'下架',DRAFT:'转草稿',DELETE:'删除',UPLOAD:'上传',REPLACE:'替换'};
export const targetTypeText:Record<string,string>={SCENE:'场景',AUDIO:'音频'};
