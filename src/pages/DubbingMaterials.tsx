import React,{useState}from'react';
import{useLoad,Notice,Pager}from'../components/Common';
import{Page,DubbingMaterialSummary,statusText}from'../types';
import{dateText}from'../api';

export default function DubbingMaterials({open}:{open:(id:string)=>void}){
 const[q,setQ]=useState(''),[status,setStatus]=useState(''),[page,setPage]=useState(1);
 const params=new URLSearchParams({q,status,page:String(page)});
 const{data,error,loading,reload}=useLoad<Page<DubbingMaterialSummary>>('/admin/dubbing-materials?'+params);
 return <><div className="title-row"><div><h1>电影配音素材</h1><p className="muted">管理电影片段、粤语台词和发布状态。</p></div><button className="primary" onClick={()=>open('new')}>＋ 新建素材</button></div>
  <div className="toolbar"><input aria-label="搜索电影素材" placeholder="搜索标题或编码" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/><select aria-label="素材状态" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">全部状态</option>{Object.entries(statusText).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
  <Notice {...{error,loading}} retry={reload}/>{data&&!loading&&<><div className="table-wrap"><table><thead><tr><th>素材</th><th>难度 / 标签</th><th>片段</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>{data.items.map(item=><tr key={item.id}><td><b>{item.title}</b><small>{item.code}</small></td><td>{item.difficulty}<small>{item.tags.join(' · ')||'无标签'}</small></td><td>{item.partCount} 个 Part</td><td><span className={'badge '+item.status}>{statusText[item.status]||item.status}</span></td><td>{dateText(item.updatedAt)}</td><td><button onClick={()=>open(String(item.id))}>编辑</button></td></tr>)}</tbody></table>{!data.items.length&&<p className="empty">没有符合条件的电影素材</p>}</div><Pager page={page} total={data.total} onChange={setPage}/></>}</>;
}
