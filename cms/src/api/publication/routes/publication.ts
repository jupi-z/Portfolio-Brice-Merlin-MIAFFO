export default {
  routes: [
    { method: 'GET', path: '/publications', handler: 'api::publication.publication.find', config: { auth: false } },
    { method: 'GET', path: '/publications/:id', handler: 'api::publication.publication.findOne', config: { auth: false } },
  ],
};
