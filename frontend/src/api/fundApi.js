import client from './client'

export const getFund = () => client.get('/fund').then(r => r.data)

export const addFund = (data) => client.post('/fund/add', data).then(r => r.data)

export const withdrawFund = (data) => client.post('/fund/withdraw', data).then(r => r.data)
