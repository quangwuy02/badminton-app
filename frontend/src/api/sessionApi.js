import client from './client'

export const getSessions = (month) => {
  const params = month ? { month } : {}
  return client.get('/sessions', { params }).then(r => r.data)
}

export const getSession = (id) => client.get(`/sessions/${id}`).then(r => r.data)

export const createSession = (data) => client.post('/sessions', data).then(r => r.data)

export const updateSession = (id, data) => client.put(`/sessions/${id}`, data).then(r => r.data)

export const deleteSession = (id) => client.delete(`/sessions/${id}`).then(r => r.data)

export const togglePayment = (sessionId, memberId) =>
  client.post(`/sessions/${sessionId}/toggle-payment/${memberId}`).then(r => r.data)

export const getStats = () => client.get('/sessions/stats').then(r => r.data)
