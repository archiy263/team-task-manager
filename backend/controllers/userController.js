import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const domain =
  process.env.NODE_ENV === "production" ? "taskmanger-server-qg2o.onrender.com" : "localhost";

const signupUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role: email === "archiy3@gmail.com" ? "admin" : "member",
  });

  try {
    await newUser.save();
    generateToken(res, newUser._id);
    res.status(201).json({
      success: true,
      _id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (isPasswordValid) {
      generateToken(res, existingUser._id);
      res.status(200).json({
        _id: existingUser._id,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: existingUser.email,
        role: existingUser.role,
        profilePicture: existingUser.profilePicture,
      });
    } else {
      res.status(401).json({ message: "Invalid Password" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  res.status(200).json(user);
});

const google = asyncHandler(async (req, res) => {
  const { name, email, googlePhotoUrl } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          domain,
          signed: true,
          path: "/",
          secure: true,
          sameSite: "None",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new userModel({
        firstname: name,
        lastname: name,
        email,
        profilePicture: googlePhotoUrl,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const { password, ...rest } = newUser._doc;

      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          domain,
          signed: true,
          path: "/",
          secure: true,
          sameSite: "None",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .json(rest);
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

export { signupUser, loginUser, logoutUser, getMe, google };
