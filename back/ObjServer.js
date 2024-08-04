require("dotenv").config();
const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

class ObjServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 888;
    this.nextJsPort = process.env.NEXTJS_PORT || 3000;
    this.proxyTo = process.env.PROXY_TARGET || "host.docker.internal";
    this.useHttps = process.env.USE_HTTPS === "true";

    if (this.useHttps) {
      this.sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        agent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL certificate validation
      };
    }

    this.JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

    this.connectDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  connectDatabase() {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error(err));
  }

  initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "your_session_secret",
        resave: false,
        saveUninitialized: true,
      })
    );
  }

  initializeRoutes() {
    this.app.post("/api/register", this.registerUser.bind(this));
    this.app.post("/api/login", this.loginUser.bind(this));
    this.app.post("/api/logout", this.logoutUser.bind(this));
    this.app.get(
      "/api/check-auth",
      this.verifyToken.bind(this),
      this.checkAuth.bind(this)
    );
    this.app.get(
      "/api/profile",
      this.verifyToken.bind(this),
      this.getProfile.bind(this)
    );
    this.app.use(
      "/",
      createProxyMiddleware({
        target: `http://${this.proxyTo}:${this.nextJsPort}`,
        changeOrigin: true,
        pathRewrite: {
          "^/": "/", // remove base path
        },
      })
    );
  }

  async registerUser(req, res) {
    const { username, password, email } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async loginUser(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
      const token = jwt.sign({ username }, this.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
        sameSite: "strict",
        path: "/",
      });
      res.status(200).json({ message: "Logged in successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  logoutUser(req, res) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  }

  verifyToken(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "No token provided" });
    }
    jwt.verify(token, this.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Failed to authenticate token" });
      }
      req.username = decoded.username;
      next();
    });
  }

  checkAuth(req, res) {
    res.status(200).json({ username: req.username });
  }

  getProfile(req, res) {
    res.status(200).json({ message: `Welcome ${req.username}` });
  }

  start() {
    if (this.useHttps) {
      https.createServer(this.sslOptions, this.app).listen(this.port, () => {
        console.log(`HTTPS Server running on port ${this.port}`);
      });
      this.startHttpRedirect();
    } else {
      http.createServer(this.app).listen(this.port, () => {
        console.log(`HTTP Server running on port ${this.port}`);
      });
    }
  }

  startHttpRedirect() {
    http
      .createServer((req, res) => {
        res.writeHead(301, {
          Location: `https://${req.headers.host}${req.url}`,
        });
        res.end();
      })
      .listen(80, () => {
        console.log("HTTP server listening on port 80, redirecting to HTTPS");
      });
  }
}

module.exports = ObjServer;
