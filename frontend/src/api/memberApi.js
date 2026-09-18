import client from './client'

export const getMembers = () => client.get('/members').then(r => r.data)

export const addMember = (data) => client.post('/members', data).then(r => r.data)

export const updateMember = (id, data) => client.put(`/members/${id}`, data).then(r => r.data)

export const deleteMember = (id) => client.delete(`/members/${id}`).then(r => r.data)

export const markAllPaid = (id) => client.post(`/members/${id}/mark-all-paid`).then(r => r.data)
