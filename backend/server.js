const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const morgan = require("morgan")
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy
const session = require("express-session")
const { createClient } = require("redis")
const RedisStore = require("connect-redis").default

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Initialize Redis client for caching
let redisClient
let redisStore

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  })

  redisClient.on("error", (err) => {
    console.log("Redis Client Error", err)
  })

  redisClient.connect().catch(console.error)

  redisStore = new RedisStore({
    client: redisClient,
    prefix: "crowd-analyzer:",
  })
} else {
  console.log("Redis URL not provided, skipping Redis initialization")
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(helmet())
app.use(morgan("dev"))

// Session middleware
app.use(
  session({
    store: redisStore || null,
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
)

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 upload requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many upload requests from this IP, please try again after a minute",
})

// Apply rate limiting to all requests
app.use("/api/", apiLimiter)
app.use("/api/upload", uploadLimiter)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, MP4, MOV, and WEBM files are allowed."))
    }
  },
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/crowd-analyzer")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Import models
const User = require("./models/User")
const Sensor = require("./models/Sensor")
const Analysis = require("./models/Analysis")
const Location = require("./models/Location")

// Passport strategies
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
          // Create new user
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
          })
          await user.save()
        }

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "/api/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ linkedinId: profile.id })

        if (!user) {
          // Create new user
          user = new User({
            linkedinId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
          })
          await user.save()
        }

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" })
      }

      req.user = user
      next()
    })
  } else {
    res.status(401).json({ message: "Authorization token required" })
  }
}

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Admin access required" })
  }
}

// Routes
// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" },
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" },
    )

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

app.get("/api/auth/verify", authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  })
})

// Google OAuth routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" },
  )

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}`)
})

// LinkedIn OAuth routes
app.get("/api/auth/linkedin", passport.authenticate("linkedin"))

app.get("/api/auth/linkedin/callback", passport.authenticate("linkedin", { failureRedirect: "/login" }), (req, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" },
  )

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}`)
})

// Upload routes
app.post('/api/upload/image', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {\
      return res.status(400).json({ message: '  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { location } = req.body;
    
    // Process the image (in a real app, this would use AI for crowd analysis)
    // For demo purposes, we'll simulate processing
    
    // Create analysis record
    const analysis = new Analysis({
      userId: req.user.id,
      fileType: 'image',
      filePath: req.file.path,
      location,
      results: {
        density: Math.floor(Math.random() * 30) + 50, // 50-80%
        hotspots: [
          { x: 150, y: 100, value: 0.8 },
          { x: 200, y: 150, value: 0.9 },
          { x: 250, y: 200, value: 0.7 },
        ],
        anomalies: Math.random() > 0.7 ? ['Unusual gathering', 'Rapid movement'] : []
      },
      timestamp: new Date()
    });
    
    await analysis.save();
    
    res.json({
      message: 'Image uploaded and analyzed successfully',
      analysis: {
        id: analysis._id,
        location: analysis.location,
        results: analysis.results,
        timestamp: analysis.timestamp
      }
    });
  } catch (error) 
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
});

app.post('/api/upload/video', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { location } = req.body;
    
    // Process the video (in a real app, this would use AI for crowd analysis)
    // For demo purposes, we'll simulate processing
    
    // Create analysis record
    const analysis = new Analysis({
      userId: req.user.id,
      fileType: 'video',
      filePath: req.file.path,
      location,
      results: {
        averageDensity: Math.floor(Math.random() * 30) + 50, // 50-80%
        peakDensity: Math.floor(Math.random() * 15) + 75, // 75-90%
        peakTime: '00:01:45',
        frames: [
          { timestamp: '00:00:30', density: 65 },
          { timestamp: '00:01:00', density: 70 },
          { timestamp: '00:01:30', density: 75 },
          { timestamp: '00:01:45', density: 85 },
          { timestamp: '00:02:00', density: 80 },
        ],
        anomalies: Math.random() > 0.5 ? ['Sudden dispersal', 'Unusual pattern'] : []
      },
      timestamp: new Date()
    });
    
    await analysis.save();
    
    res.json({
      message: 'Video uploaded and analyzed successfully',
      analysis: {
        id: analysis._id,
        location: analysis.location,
        results: analysis.results,
        timestamp: analysis.timestamp
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Server error during video upload' });
  }
});

// Livestream route
app.post('/api/livestream', authenticateJWT, async (req, res) => {
  try {
    const { location } = req.body;
    
    // In a real app, this would establish a WebRTC connection
    // For demo purposes, we'll simulate a connection
    
    res.json({
      message: 'Live feed connection established',
      connectionId: 'live-' + Math.random().toString(36).substring(2, 10),
      location,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Livestream error:', error);
    res.status(500).json({ message: 'Server error during livestream setup' });
  }
});

// Sensor routes
app.get('/api/sensors', authenticateJWT, async (req, res) => {
  try {
    const { location } = req.query;
    
    const query = {};
    if (location) {
      query.location = location;
    }
    
    const sensors = await Sensor.find(query);
    
    res.json({ sensors });
  } catch (error) {
    console.error('Sensor fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching sensors' });
  }
});

app.post('/api/sensors', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, location, type } = req.body;
    
    const sensor = new Sensor({
      name,
      location,
      type,
      status: 'online',
      battery: 100,
      lastUpdated: new Date()
    });
    
    await sensor.save();
    
    res.status(201).json({
      message: 'Sensor added successfully',
      sensor
    });
  } catch (error) {
    console.error('Sensor creation error:', error);
    res.status(500).json({ message: 'Server error while creating sensor' });
  }
});

app.put('/api/sensors/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const sensor = await Sensor.findByIdAndUpdate(id, updates, { new: true });
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    
    res.json({
      message: 'Sensor updated successfully',
      sensor
    });
  } catch (error) {
    console.error('Sensor update error:', error);
    res.status(500).json({ message: 'Server error while updating sensor' });
  }
});

app.delete('/api/sensors/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sensor = await Sensor.findByIdAndDelete(id);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    
    res.json({
      message: 'Sensor deleted successfully'
    });
  } catch (error) {
    console.error('Sensor deletion error:', error);
    res.status(500).json({ message: 'Server error while deleting sensor' });
  }
});

// Location routes
app.get('/api/locations', authenticateJWT, async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const locations = await Location.find(query);
    
    res.json({ locations });
  } catch (error) {
    console.error('Location fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching locations' });
  }
});

app.post('/api/locations', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, coordinates } = req.body;
    
    const location = new Location({
      name,
      coordinates
    });
    
    await location.save();
    
    res.status(201).json({
      message: 'Location added successfully',
      location
    });
  } catch (error) {
    console.error('Location creation error:', error);
    res.status(500).json({ message: 'Server error while creating location' });
  }
});

// Analysis routes
app.get('/api/analysis', authenticateJWT, async (req, res) => {
  try {
    const { location, startDate, endDate, type } = req.query;
    
    const query = { userId: req.user.id };
    
    if (location) {
      query.location = location;
    }
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) {
      query.fileType = type;
    }
    
    const analyses = await Analysis.find(query).sort({ timestamp: -1 });
    
    res.json({ analyses });
  } catch (error) {
    console.error('Analysis fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching analyses' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({ users });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

app.put('/api/admin/users/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { role, isActive }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

