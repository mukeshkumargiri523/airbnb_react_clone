require("dotenv").config();
//model
const { default: mongoose } = require("mongoose");
const User = require("./models/userModel");
const Place = require("./models/placeModel");
const Booking = require("./models/bookingModel.js");

//packages
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");

const app = express();

const secretSalt = 8;
const jwtSecret = "delhi/mumbai/chennai";
// app.use(
//   cors({
//     credentials: true,
//     origin: "http://localhost:5173",
//   })
// );
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log("Listening at port " + process.env.PORT)
    );
  })
  .catch((error) => console.log(error));

//functions
function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    const { token } = req?.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        resolve(user);
      });
    } else {
      res.json(null);
    }
  });
}
//routes
app.get("/test", (req, res) => {
  res.json("okk bro");
});
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let hashPassword = await bcrypt.hash(password, secretSalt);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (user) {
      let logPass = bcrypt.compareSync(password, user.password);
      if (logPass) {
        jwt.sign(
          { email: user.email, id: user._id, name: user.name },
          jwtSecret,
          { expiresIn: "1d" },
          (err, token) => {
            if (err) throw err;
            res.status(200).cookie("token", token).json(user);
          }
        );
      } else {
        res.status(401).json("Unauthorized Request");
      }
    } else {
      res.status(401).json("User not Found");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/profile", (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        const { name, email, _id } = await User.findById(user.id);
        res.status(200).json({ name, email, _id });
      });
    } else {
      res.json("null");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/user-info", (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        const { userPhone, city, country, name } = await User.findById(user.id);
        if (userPhone !== "" && city !== "" && country !== "") {
          res.status(200).json({ userPhone, city, country, name });
        } else {
          res.json(null);
        }
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});
app.put("/user-info", (req, res) => {
  try {
    const { name, userPhone, city, country } = req.body;
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;

        const userDocs = await User.findByIdAndUpdate(
          user.id,
          { name, userPhone, city, country },
          {
            new: true,
          }
        );

        res.status(201).json(userDocs);
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/logout", (req, res) => {
  try {
    res.status(200).cookie("token", "").json("logout success");
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/upload-by-link", async (req, res) => {
  try {
    const { link } = req.body;
    const newName = "photo" + Date.now() + ".jpg";
    await imageDownloader.image({
      url: link,
      dest: __dirname + "/uploads/" + newName,
    });
    res.status(201).json(newName);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

const photosMiddelware = multer({ dest: "uploads" });

app.post("/upload", photosMiddelware.array("photos", 100), async (req, res) => {
  try {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath.replace("uploads\\", ""));
    }

    res.json(uploadedFiles);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/places", (req, res) => {
  try {
    const { token } = req.cookies;
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        const placeDocs = await Place.create({
          owner: user.id,
          title,
          address,
          photos: addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        });
        res.status(201).json(placeDocs);
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/user-places", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        const { id } = user;
        const places = await Place.find({ owner: id });
        res.status(200).json(places);
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let placeData = await Place.findById(id);
    res.status(200).json(placeData);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.put("/places", async (req, res) => {
  try {
    const { token } = req.cookies;
    const {
      id,
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) throw err;
        const placeDocs = await Place.findById(id);
        if (user.id === placeDocs.owner.toString()) {
          placeDocs.set({
            owner: user.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price,
          });
          await placeDocs.save();
          res.status(201).json(placeDocs.title);
        }
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/places", async (req, res) => {
  try {
    let placeData = await Place.find();
    res.status(200).json(placeData);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/booking", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  try {
    let bookingData = await Booking.create({
      place,
      user: userData.id,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
    });
    res.status(201).json(bookingData._id);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    const bookingData = await Booking.find({ user: userData.id }).populate(
      "place"
    );
    res.status(200).json(bookingData);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});
