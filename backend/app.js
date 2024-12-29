
const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://chinjiasin:1F4zQGq5UZVSy6TJ@cluster0.r8vh0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cors = require("cors");
const { createServer } = require("http");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(cors());
app.use(express.json());

async function connectDBUser() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    return client.db("Cinema").collection("users");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

app.post("/api/register", async (req, res) => {
    try {
      const collection = await connectDBUser();
      const { Email, Password, Name, MobileNo, DOB, Profession, Location } = req.body;
  
      const existingUser = await collection.findOne({ Email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      const lastUser = await collection.findOne({}, { sort: { id: -1 } });
      const newId = lastUser ? lastUser.id + 1 : 1;
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
  
      const newUser = {
        id: newId,
        Name,
        MobileNo,
        Email,
        Password: hashedPassword, 
        DOB,
        Profession,
        Location
      };
  

      await collection.insertOne(newUser);
  
      const { Password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const collection = await connectDBUser();
      
      const user = await collection.findOne({ Email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(Password, user.Password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.status(200).json({ 
        message: "Login successful",
        user: {
          id: user.id,
          Name: user.Name,
          Email: user.Email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// app.post("/api/users", async (req, res) => {
//   try {
//     const collection = await connectDBUser();
//     const lastUser = await collection.findOne({}, { sort: { id: -1 } });
//     const newId = lastUser ? lastUser.id + 1 : 1;
    
//     const newUser = {
//       id: newId,
//       ...req.body
//     };
    
//     const result = await collection.insertOne(newUser);
//     res.status(201).json({ message: "User created successfully", user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

app.get("/api/users", async (req, res) => {
  try {
    const collection = await connectDBUser();
    const users = await collection.find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const collection = await connectDBUser();
    const user = await collection.findOne({ id: parseInt(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const collection = await connectDBUser();
    const result = await collection.updateOne(
      { id: parseInt(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const collection = await connectDBUser();
    const result = await collection.deleteOne({ id: parseInt(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

async function connectDBMovie() {
    try {
      await client.connect();
      console.log("Connected to MongoDB!");
      return client.db("Cinema").collection("movies");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

app.post("/api/movies", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const lastMovie = await collection.findOne({}, { sort: { _id: -1 } });
      const newId = lastMovie ? (parseInt(lastMovie._id) + 1).toString() : "1";
      
      const newMovie = {
        _id: newId,
        ...req.body,
        duration: { $numberInt: req.body.duration.toString() }
      };
      
      const result = await collection.insertOne(newMovie);
      
      io.emit("movieAdded", newMovie);
      
      res.status(201).json({ message: "Movie created successfully", movie: newMovie });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  app.get("/api/movies", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const movies = await collection.find({}).toArray();
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const movie = await collection.findOne({ _id: req.params.id });
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.status(200).json(movie);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/movies/:id", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const updateData = { ...req.body };
      
      if (updateData.duration) {
        updateData.duration = { $numberInt: updateData.duration.toString() };
      }
      
      const result = await collection.updateOne(
        { _id: req.params.id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const updatedMovie = await collection.findOne({ _id: req.params.id });
      io.emit("movieUpdated", updatedMovie);
      
      res.status(200).json({ message: "Movie updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.delete("/api/movies/:id", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const result = await collection.deleteOne({ _id: req.params.id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      io.emit("movieDeleted", req.params.id);
      
      res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/movies/showtimes/:date/:cinema", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const { date, cinema } = req.params;
      
      const movies = await collection.find({
        "showtimes": {
          $elemMatch: {
            "date": date,
            "cinema.name": { $regex: cinema, $options: "i" }
          }
        }
      }).toArray();
      
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  app.post("/api/movies/:id/showtimes", async (req, res) => {
    try {
      const collection = await connectDBMovie();
      const { showtime } = req.body;
      
      const result = await collection.updateOne(
        { _id: req.params.id },
        { $push: { showtimes: showtime } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const updatedMovie = await collection.findOne({ _id: req.params.id });
      io.emit("showtimeAdded", { movieId: req.params.id, showtime });
      
      res.status(200).json({ message: "Showtime added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
});

async function connectDBBooking() {
    try {
      await client.connect();
      console.log("Connected to MongoDB!");
      return client.db("Cinema").collection("booking");
    } catch (error) {
      console.error("Database caonnection error:", error);
      throw error;
    }
  }
  
  // Generate a unique booking ID
  function generateBookingId() {
    return 'BKG' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      
      const newBooking = {
        booking_id: generateBookingId(),
        ...req.body,
        booking_date: new Date().toISOString().split('T')[0],
        booking_status: "Confirmed"
      };
      
      const result = await collection.insertOne(newBooking);
      
      // Emit socket event for real-time updates
      io.emit("bookingCreated", newBooking);
      
      res.status(201).json({ 
        message: "Booking created successfully", 
        booking: newBooking 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      const bookings = await collection.find({}).toArray();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Get bookings by user ID
  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      const bookings = await collection.find({
        "user.id": parseInt(req.params.userId)
      }).toArray();
      
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Get booking by booking ID
  app.get("/api/bookings/:bookingId", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      const booking = await collection.findOne({ 
        booking_id: req.params.bookingId 
      });
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Update booking
  app.put("/api/bookings/:bookingId", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      const updateData = { ...req.body };
      
      const result = await collection.updateOne(
        { booking_id: req.params.bookingId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const updatedBooking = await collection.findOne({ 
        booking_id: req.params.bookingId 
      });
      
      // Emit socket event for real-time updates
      io.emit("bookingUpdated", updatedBooking);
      
      res.status(200).json({ 
        message: "Booking updated successfully",
        booking: updatedBooking
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Delete booking
  app.delete("/api/bookings/:bookingId", async (req, res) => {
    try {
      const collection = await connectDBBooking();
      const result = await collection.deleteOne({ 
        booking_id: req.params.bookingId 
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Emit socket event for real-time updates
      io.emit("bookingDeleted", req.params.bookingId);
      
      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Update booking status
  app.patch("/api/bookings/:bookingId/status", async (req, res) => {
    try {
      const { status } = req.body;
      const collection = await connectDBBooking();
      
      const result = await collection.updateOne(
        { booking_id: req.params.bookingId },
        { $set: { booking_status: status } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const updatedBooking = await collection.findOne({ 
        booking_id: req.params.bookingId 
      });
      
      // Emit socket event for real-time updates
      io.emit("bookingStatusUpdated", {
        bookingId: req.params.bookingId,
        status: status
      });
      
      res.status(200).json({ 
        message: "Booking status updated successfully",
        booking: updatedBooking
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });



const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


