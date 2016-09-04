module.exports.validateAdmin = function(req, res, next) {
  if(!req.user || !req.user.admin) {
    res.status(401).send('nope');
  } else {
    next();
  }
}
