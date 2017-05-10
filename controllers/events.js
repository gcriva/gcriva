'use strict';

const Events = require('../models/Event');
const { pick } = require('ramda');

exports.event = (req, res, next) => {
  Events.list()
    .then(response => {
      res.json({
        event: response.entities
      });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  const event = new Events(pick(
      ['name', 'dateStart', 'dateEnd', 'description'],
      req.body.event
    ));
  event.save()
  .then(() => {
    res.json({ event: event.plain() });
  })
  .catch(next);
};

exports.update = (req, res, next) => {
  const event = pick(['name', 'dateStart', 'dateEnd', 'description'], req.body.event);
  Events.update(req.params.id, event)
  .then((updatedEvent) => {
    res.json({ event: updatedEvent.plain() });
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
