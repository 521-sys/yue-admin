import { afterEach, expect, it, vi } from 'vitest';
import { mediaUrl, request } from '../api';
afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });
it('uploads FormData without breaking its browser boundary', async () => {
  const fetcher=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{"id":"upload:1"}',{status:200}));
  const body=new FormData();body.append('file',new Blob(['audio']),'test.wav');
  await request('/admin/audio',{method:'POST',body});
  const headers=new Headers(fetcher.mock.calls[0][1]?.headers);
  expect(headers.has('Content-Type')).toBe(false);
});
it('handles successful empty DELETE responses',async()=>{
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(null,{status:204}));
 await expect(request('/admin/scenes/1',{method:'DELETE'})).resolves.toBeUndefined();
});
it('expires only the admin session and notifies the UI',async()=>{
 sessionStorage.setItem('admin_token','expired');sessionStorage.setItem('other','keep');
 const listener=vi.fn();window.addEventListener('admin-auth-changed',listener);
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{"error":"登录已过期"}',{status:401}));
 await expect(request('/admin/users')).rejects.toThrow('登录已过期');
 expect(sessionStorage.getItem('admin_token')).toBeNull();expect(sessionStorage.getItem('other')).toBe('keep');expect(listener).toHaveBeenCalled();
 window.removeEventListener('admin-auth-changed',listener);
});
it('uses the same-origin api prefix by default',async()=>{
 const fetcher=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:200}));
 await request('/admin/users');
 expect(fetcher).toHaveBeenCalledWith('/api/admin/users',expect.any(Object));
});
it('keeps uploaded media outside the api prefix',()=>{
 expect(mediaUrl('/audio/uploads/demo')).toBe('http://localhost:3000/audio/uploads/demo');
});
