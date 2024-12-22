import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY);
};