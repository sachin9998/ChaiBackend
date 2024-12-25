import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details from frontend
  const { username, fullName, email, password } = req.body;

  console.log(req.body);

  // console.log(username);
  // console.log(fullName);
  // console.log(email);
  // console.log(password);

  // 2. Validation - not empty
  if (!username || !fullName || !email || !password) {
    throw new ApiError(400, "Missing required fields!!!");
  }

  // if (
  //   [fullName, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }

  // 3. check if user already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username Already Exists..");
  }

  // console.log(req.files);

  // 4. check for images, check for avtar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // 5. Upload them to cloudinary, Avtar checking
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // 6. Create user object store in MongoDB database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  // 7. remove password and refresh token field from respone
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 8. check for user creation response
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  // 9. return response
  return res
    .status(201)
    .json(new APIResponse(200, createdUser, "User registerd Successfully"));
});

export { registerUser };
