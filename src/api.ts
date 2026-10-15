export const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
export function logout() { sessionStorage.removeItem('admin_token'); window.dispatchEvent(new Event('admin-auth-changed')); }
export async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
 const headers = new Headers(init.headers);
 if (!(init.body instanceof FormData) && init.body != null) headers.set('Content-Type','application/json');
 const token=sessionStorage.getItem('admin_token'); if(token)headers.set('Authorization',`Bearer ${token}`);
 const response=await fetch(API+path,{...init,headers});
 if(response.status===401)logout();
 if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.error || (response.status===403?'没有管理员权限':'请求失败，请稍后重试'));}
 return response.status===204?undefined as T:response.json();
}
export function mediaUrl(path?: string) { if(!path)return ''; return new URL(path,new URL(API,location.href)).href; }
export function audioKeyUrl(key?: string){return key?mediaUrl(key.startsWith('upload:')?'/audio/uploads/'+key.slice(7):'/audio/'+key):'';}
export const dateText=(value?:string)=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'—';
