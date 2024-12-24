import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details from frontend
  const { username, fullName, email, password } = req.body;

  console.log(username);
  console.log(fullName);
  console.log(email);
  console.log(password);

  // 2. Validation - not empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }

  // 3. check if user already exists: username, email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new APIError(409, "User with email or username Already Exists..");
  }

  // 4. check for images, check for avtar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // 5. Upload them to cloudinary, Avtar checking
  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new APIError(400, "Avatar is required");
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
    throw new APIError(500, "Something went wrong while registering the user.");
  }

  // 9. return response
  return res
    .status(201)
    .json(new APIResponse(200, createdUser, "User registerd Successfully"));
});

export { registerUser };
