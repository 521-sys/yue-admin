import React,{useEffect,useState} from 'react';
import {request} from '../api';
export function useLoad<T>(path:string){
 const [data,setData]=useState<T>();const[error,setError]=useState('');const[loading,setLoading]=useState(true);const[revision,setRevision]=useState(0);
 useEffect(()=>{let alive=true;setLoading(true);setError('');request<T>(path).then(v=>{if(alive)setData(v)}).catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[path,revision]);
 return {data,error,loading,reload:()=>setRevision(v=>v+1)};
}
export function Notice({error,loading,retry}:{error?:string;loading?:boolean;retry?:()=>void}){return <>{loading&&<p className="muted" role="status">正在加载…</p>}{error&&<div className="error" role="alert">{error} {retry&&<button onClick={retry}>重试</button>}</div>}</>}
export function Pager({page,total,onChange}:{page:number;total:number;onChange:(n:number)=>void}){return <div className="pager"><span>共 {total} 条 · 第 {page} 页</span><button disabled={page<=1} onClick={()=>onChange(page-1)}>上一页</button><button disabled={page*20>=total} onClick={()=>onChange(page+1)}>下一页</button></div>}
