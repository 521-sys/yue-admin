import React from 'react';
import '@testing-library/jest-dom/vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import * as api from '../api';
import DubbingMaterials from '../pages/DubbingMaterials';
import DubbingMaterialEditor from '../pages/DubbingMaterialEditor';
import App from '../App';

afterEach(()=>{cleanup();vi.restoreAllMocks()});

const detail={
 id:7,code:'movie-one',title:'电影一',difficulty:'B1',tags:['家庭'],sourceLabel:'片源',sourceUrl:'https://example.com/source',
 licenseLabel:'CC BY',licenseUrl:'https://example.com/license',status:'DRAFT',sortOrder:10,materialVersion:2,
 createdAt:'2026-10-22T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',parts:[
  {id:11,code:'part-01',label:'Part 01',title:'开场',sortOrder:1,version:3,video:null,cues:[
   {code:'cue-01',startMs:0,endMs:1000,text:'第一句'},{code:'cue-02',startMs:1000,endMs:2000,text:'第二句'}]},
  {id:12,code:'part-02',label:'Part 02',title:'继续',sortOrder:2,version:1,video:{partId:12,url:'/api/admin/dubbing-materials/7/parts/12/video?v=1',originalName:'p2.mp4',contentType:'video/mp4',sizeBytes:2048,durationMs:3200,videoCodec:'h264',audioCodec:'aac',videoVersion:1,version:1},cues:[{code:'cue-03',startMs:0,endMs:800,text:'第三句'}]}
 ]
};

it('opens movie dubbing management from the sidebar',async()=>{
 sessionStorage.setItem('admin_token','token');location.hash='';
 vi.spyOn(api,'request').mockResolvedValue({items:[],total:0,page:1,pageSize:20});
 render(<App/>);
 fireEvent.click(screen.getByRole('button',{name:/电影配音/}));
 expect(await screen.findByRole('heading',{name:'电影配音素材'})).toBeInTheDocument();
 sessionStorage.clear();
});

it('filters the material list and exposes empty/retry states',async()=>{
 const request=vi.spyOn(api,'request').mockRejectedValueOnce(new Error('网络错误')).mockResolvedValue({items:[],total:0,page:1,pageSize:20});
 render(<DubbingMaterials open={()=>{}}/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('网络错误');
 fireEvent.click(screen.getByRole('button',{name:'重试'}));
 expect(await screen.findByText('没有符合条件的电影素材')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('搜索电影素材'),{target:{value:'家庭'}});
 fireEvent.change(screen.getByLabelText('素材状态'),{target:{value:'PUBLISHED'}});
 await waitFor(()=>expect(request.mock.calls.some(([path])=>String(path).includes('q=%E5%AE%B6%E5%BA%AD')&&String(path).includes('status=PUBLISHED'))).toBe(true));
});

it('keeps edited inputs on conflict and preserves part/cue ordering in the save payload',async()=>{
 const request=vi.spyOn(api,'request').mockResolvedValueOnce(detail).mockRejectedValueOnce(new Error('素材已更新，请重新加载'));
 render(<DubbingMaterialEditor id="7" back={()=>{}} dirtyChanged={()=>{}}/>);
 const title=await screen.findByLabelText('素材标题');
 fireEvent.change(title,{target:{value:'我的标题'}});
 const firstPart=screen.getAllByTestId('dubbing-part')[0];
 fireEvent.click(within(firstPart).getAllByRole('button',{name:'台词下移'})[0]);
 fireEvent.click(screen.getAllByRole('button',{name:'Part 下移'})[0]);
 fireEvent.click(screen.getByRole('button',{name:'保存内容'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('素材已更新');
 expect(title).toHaveValue('我的标题');
 const body=JSON.parse(String(request.mock.calls[1][1]?.body));
 expect(body.parts.map((p:any)=>p.code)).toEqual(['part-02','part-01']);
 expect(body.parts[1].cues.map((c:any)=>c.code)).toEqual(['cue-02','cue-01']);
});

it('uploads an mp4 separately and displays trusted server metadata',async()=>{
 const uploaded={...detail,materialVersion:3,parts:[{...detail.parts[0],version:4,video:{partId:11,url:'/api/admin/dubbing-materials/7/parts/11/video?v=1',originalName:'clip.mp4',contentType:'video/mp4',sizeBytes:4096,durationMs:9000,videoCodec:'h264',audioCodec:'aac',videoVersion:1,version:4}},detail.parts[1]]};
 const request=vi.spyOn(api,'request').mockResolvedValueOnce(detail).mockResolvedValueOnce(uploaded);
 render(<DubbingMaterialEditor id="7" back={()=>{}} dirtyChanged={()=>{}}/>);
 const input=await screen.findByLabelText('Part 01 视频文件');
 const file=new File(['video'],'clip.mp4',{type:'video/mp4'});
 fireEvent.change(input,{target:{files:[file]}});
 fireEvent.click(screen.getByRole('button',{name:'上传 Part 01 视频'}));
 await screen.findByText(/9\.000 秒 · h264 \/ aac/);
 expect(request.mock.calls[1][0]).toContain('/admin/dubbing-materials/7/parts/11/video?materialVersion=2&partVersion=3');
 expect(request.mock.calls[1][1]?.body).toBeInstanceOf(FormData);
 expect(screen.getByRole('button',{name:'预览 Part 01 视频'})).toBeEnabled();
});

it('disables video replacement and part deletion while published',async()=>{
 vi.spyOn(api,'request').mockResolvedValue({...detail,status:'PUBLISHED'});
 render(<DubbingMaterialEditor id="7" back={()=>{}} dirtyChanged={()=>{}}/>);
 expect(await screen.findByLabelText('Part 01 视频文件')).toBeDisabled();
 expect(screen.getAllByRole('button',{name:'删除 Part'}).every(button=>(button as HTMLButtonElement).disabled)).toBe(true);
});
