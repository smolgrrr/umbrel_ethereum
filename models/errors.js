/* eslint-disable no-magic-numbers */
function NodeError(message, statusCode) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.statusCode = statusCode;
}
require('util').inherits(NodeError, Error);

function ethereumdError(message, error, statusCode) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.error = error;
  this.statusCode = statusCode;
}
require('util').inherits(ethereumdError, Error);

function ValidationError(message, statusCode) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.statusCode = statusCode || 400;
}
require('util').inherits(ValidationError, Error);

module.exports = {
  NodeError,
  ethereumdError,
  ValidationError
};

