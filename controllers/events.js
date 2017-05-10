'use strict';

const Events = require('../models/Events');
const { pick } = require('ramda');

exports.events = (req, res, next) => {
  Events.list()
    .then(response => {
      res.json({
        events: response.entities
      });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  const events = new Events(pick(
      ['name', 'dateStart', 'dateEnd', 'description'],
      req.body.events
    ));
  events.save()
  .then(() => {
    res.json({ events: events.plain() });
  })
  .catch(next);
};

exports.update = (req, res, next) => {
  const events = pick(['name', 'dateStart', 'dateEnd', 'description'], req.body.events);
  Events.update(req.params.id, beneficiary)
  .then((updatedEvents) => {
    res.json({ events: updatedEvents.plain() });
  })
  .catch(next);
};

exports.delete = (req, res, next) => {
  Events.delete(req.params.id)
  .then((response) => {
    if (response.success) {
      res.json({ key: response.key });
    } else {
      res.error(404, 'Evento não foi encontrado');
    }
  })
  .catch(next);

};
