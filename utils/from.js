/**
 * wrapper to handle result and error
 * Returns tuple as data and error
 * @param {Promise} promise
 */
const from = promise => {
  return promise
    .then(result => ({ result, error: null }))
    .catch(error => ({ result: null, error }))
};

module.exports = from;
