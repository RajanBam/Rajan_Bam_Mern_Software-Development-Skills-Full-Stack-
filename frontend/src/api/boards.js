import { api } from './client';

export const listBoards = () => api('/boards');
export const createBoard = (title) => api('/boards', { method: 'POST', body: { title } });
export const getBoard = (id) => api(`/boards/${id}`);
export const saveBoard = (id, payload) => api(`/boards/${id}`, { method: 'PUT', body: payload });
export const deleteBoard = (id) => api(`/boards/${id}`, { method: 'DELETE' });
export const getSharedBoard = (shareId) => api(`/boards/shared/${shareId}`, { auth: false });
