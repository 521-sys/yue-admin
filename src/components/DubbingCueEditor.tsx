import React from'react';
import{DubbingCue}from'../types';

export default function DubbingCueEditor({cue,index,onChange,onMove,onRemove}:{cue:DubbingCue;index:number;onChange:(cue:DubbingCue)=>void;onMove:(delta:number)=>void;onRemove:()=>void}){
 const set=(key:keyof DubbingCue,value:string|number)=>onChange({...cue,[key]:value});
 return <div className="cue-row"><div className="cue-head"><b>台词 {index+1}</b><span className="actions"><button aria-label="台词上移" disabled={index===0} onClick={()=>onMove(-1)}>↑</button><button aria-label="台词下移" onClick={()=>onMove(1)}>↓</button><button className="danger" onClick={onRemove}>删除台词</button></span></div><div className="cue-fields"><label>编码<input value={cue.code} onChange={e=>set('code',e.target.value)}/></label><label>开始（毫秒）<input type="number" min="0" value={cue.startMs} onChange={e=>set('startMs',Number(e.target.value))}/></label><label>结束（毫秒）<input type="number" min="1" value={cue.endMs} onChange={e=>set('endMs',Number(e.target.value))}/></label><label className="cue-text">粤语台词<textarea value={cue.text} onChange={e=>set('text',e.target.value)}/></label></div></div>;
}
