const admin =  require('firebase-admin');
const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    console.log(`token:${token}`)
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

admin.auth().verifyIdToken(token)
  .then((decodedToken) => {
    const uid = decodedToken.uid;
    req.uid=uid
    next()
  })
  .catch((error) => {
    return res.status(403).json({msg:
        "Invalid token, authorization denied"});
  });
  };
  
  module.exports = verifyToken;