import React,{useEffect,useState}from'react';
import{adminMediaBlobUrl}from'../api';
import type{DubbingCover}from'../types';

export default function DubbingCoverEditor({cover,saved,published,dirty,busy,onUpload}:{cover?:DubbingCover|null;saved:boolean;published:boolean;dirty:boolean;busy:boolean;onUpload:(file:File)=>Promise<void>}){
 const[file,setFile]=useState<File>(),[preview,setPreview]=useState(''),[error,setError]=useState('');
 useEffect(()=>{
  let alive=true,url='';setPreview('');setError('');
  if(cover)adminMediaBlobUrl(cover.url).then(value=>{url=value;if(alive)setPreview(value);else URL.revokeObjectURL(value)}).catch(()=>{if(alive)setError('封面加载失败，请重新加载素材')});
  return()=>{alive=false;if(url)URL.revokeObjectURL(url)};
 },[cover?.url]);
 const disabled=!saved||published||dirty||busy;
 return <section className="panel cover-editor"><h2>素材封面</h2><p className="muted">建议 16:9 横图，JPEG / PNG，最大 5 MiB。</p>
  {preview?<img className="cover-preview" src={preview} alt="素材封面预览"/>:<div className="cover-placeholder">{error?'封面暂不可用':cover?'正在加载封面…':'尚未上传封面'}</div>}
  {cover&&<p>{cover.originalName} · {cover.width} × {cover.height} · {(cover.sizeBytes/1024).toFixed(1)} KiB</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  <div className="upload-row"><label>素材封面文件<input type="file" accept="image/jpeg,image/png" disabled={disabled} onChange={e=>setFile(e.target.files?.[0])}/></label>
  <button disabled={disabled||!file} onClick={()=>file&&onUpload(file)}>{cover?'替换':'上传'}素材封面</button></div>
  {!saved?<p className="muted">先保存素材，再上传封面。</p>:published?<p className="warning">先下架素材，再替换封面。</p>:dirty&&<p className="muted">先保存内容修改，再上传封面。</p>}
 </section>;
}
