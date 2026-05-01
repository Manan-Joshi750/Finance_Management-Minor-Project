const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check if the request has an authorization header starting with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token_string>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's ID to the request object so our routes can use it
      req.user = { id: decoded.id };
      next(); // The user is valid, let them into the route!

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };