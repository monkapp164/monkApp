import api from '../api/axiosConfig'

export const authService = {
  registrar: (d) => api.post('/auth/registro', d),
  verificar: (d) => api.post('/auth/verificar', d),
  reenviarCodigo: (correo) => api.post(`/auth/reenviar-codigo?correo=${correo}`),
  login: (d) => api.post('/auth/login', d),
}

export const clienteService = {
  listar: () => api.get('/clientes'),
  conDeuda: () => api.get('/clientes/con-deuda'),
  obtener: (id) => api.get(`/clientes/${id}`),
  crear: (d) => api.post('/clientes', d),
  actualizar: (id, d) => api.put(`/clientes/${id}`, d),
  eliminar: (id) => api.delete(`/clientes/${id}`),
  pdf: (id) => api.get(`/dashboard/clientes/${id}/pdf`, { responseType: 'blob' }),
}

export const productoService = {
  listar: () => api.get('/productos'),
  stockBajo: () => api.get('/productos/stock-bajo'),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (d) => api.post('/productos', d),
  actualizar: (id, d) => api.put(`/productos/${id}`, d),
  eliminar: (id) => api.delete(`/productos/${id}`),
}

export const ventaService = {
  listar: () => api.get('/ventas'),
  listarPorCliente: (clienteId) => api.get(`/ventas/cliente/${clienteId}`),
  obtener: (id) => api.get(`/ventas/${id}`),
  crear: (d) => api.post('/ventas', d),
  anular: (id) => api.patch(`/ventas/${id}/anular`),
}

export const abonoService = {
  listarPorCliente: (clienteId) => api.get(`/abonos/cliente/${clienteId}`),
  registrar: (d) => api.post('/abonos', d),
}

export const gastoService = {
  listar: () => api.get('/gastos'),
  obtener: (id) => api.get(`/gastos/${id}`),
  crear: (d) => api.post('/gastos', d),
  eliminar: (id) => api.delete(`/gastos/${id}`),
}

export const dashboardService = {
  obtener: () => api.get('/dashboard'),
}

export const configuracionService = {
  obtener: () => api.get('/configuracion'),
  actualizar: (d) => api.put('/configuracion', d),
}