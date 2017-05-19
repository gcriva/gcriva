'use strict';

const Event = require('../models/Event');
const { pick } = require('ramda');

const eventParams = pick(['name', 'startDate', 'endDate', 'description', 'beneficiaries']);

exports.index = (req, res, next) => {
  Event.list()
    .then(response => {
      res.json({
        event: response.entities
      });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  const event = new Event(eventParams(req.body.event));
  event.save()
    .then(() => {
      res.json({ event: event.plain() });
    })
    .catch(next);
};

exports.update = (req, res, next) => {
  const event = eventParams(req.body.event);
  Event.update(req.params.id, event)
    .then((updatedEvent) => {
      res.json({ event: updatedEvent.plain() });
    })
    .catch(next);
};

exports.delete = (req, res, next) => {
  Event.delete(req.params.id)
  .then((response) => {
    if (response.success) {
      res.json({ key: response.key });
    } else {
      res.error(404, 'Evento não foi encontrado');
    }
  })
  .catch(next);
};
