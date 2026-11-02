export default {
  admin: {
    type: 'admin',
    routes: [
      { method: 'GET', path: '/publications', handler: 'editorial.list', config: { auth: true } },
      { method: 'POST', path: '/publications', handler: 'editorial.create', config: { auth: true } },
    ],
  },
};
