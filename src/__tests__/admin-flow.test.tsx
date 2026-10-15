import React from 'react';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
import SceneEditor from '../pages/SceneEditor';
import * as api from '../api';
afterEach(()=>{cleanup();vi.restoreAllMocks()});
const scene={id:1,code:'tea',title:'茶餐厅',place:'香港',emoji:'',roleA:'店员',roleB:'顾客',category:'日常生活',difficulty:'初级',sortOrder:0,version:1,status:'DRAFT',builtin:true};
it('keeps operator edits after a conflicting save',async()=>{
 vi.spyOn(api,'request').mockResolvedValueOnce({scene,lines:[]}).mockRejectedValueOnce(new Error('内容已更新，请重新加载后再编辑'));
 render(<SceneEditor id="1" back={()=>{}} dirtyChanged={()=>{}}/>);
 const title=await screen.findByLabelText('场景标题');fireEvent.change(title,{target:{value:'我的新标题'}});
 fireEvent.click(screen.getByRole('button',{name:'保存内容'}));
 await screen.findByRole('alert');expect((title as HTMLInputElement).value).toBe('我的新标题');
});
it('saves dialogue order and publishes the saved version',async()=>{
 const request=vi.spyOn(api,'request').mockImplementation(async(path,init)=>{
  if(init?.method==='POST')return {scene:{...scene,version:2},lines:[{speaker:'A',cantoneseText:'唔该',mandarinText:'谢谢'}]};
  if(path.endsWith('/status'))return {scene:{...scene,status:'PUBLISHED',version:3},lines:[]};
  return {scene,lines:[]};
 });
 render(<SceneEditor id="new" back={()=>{}} dirtyChanged={()=>{}}/>);
 for(const[label,value]of [['场景编码','tea'],['场景标题','茶餐厅'],['地点','香港'],['角色 A','店员'],['角色 B','顾客']])fireEvent.change(screen.getByLabelText(label),{target:{value}});
 fireEvent.click(screen.getByRole('button',{name:'＋ 添加台词'}));
 fireEvent.change(screen.getByLabelText('第1句粤语'),{target:{value:'唔该'}});fireEvent.change(screen.getByLabelText('第1句释义'),{target:{value:'谢谢'}});
 fireEvent.click(screen.getByRole('button',{name:'保存内容'}));await screen.findByText('保存成功');
 fireEvent.click(screen.getByRole('button',{name:'发布场景'}));
 await waitFor(()=>expect(request.mock.calls.some(([p,i])=>p.endsWith('/status')&&JSON.parse(String(i?.body)).version===2)).toBe(true));
});
