import Users from "../models/users.model.js";
import jwt from 'jsonwebtoken';
import { catchError } from "../utils/err-res.js";
import { UsersValidator } from "../validation/users.validation.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt-encrypt.js";
import { generateOTP } from "../utils/otp-generator.js";
import { setCache, getCache } from "../utils/cache.js";
import { transporter } from "../utils/mail-sender.js";
import { writeToCookie } from "../utils/cookie.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-tokens.js";

export class UsersController {
  async createUser(req, res) {
    try {
      const { error, value } = UsersValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const existEmail = await Users.findOne({
        gmail: value.gmail,
      });
      if (existEmail) {
        return catchError(409, "Gmail already exist", res);
      }
      const hashedPassword = await hashPassword(value.password, 7);
      value.password = hashedPassword;
      const user = await Users.create(value);
      return res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: user,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async getAllUsers(_, res) {
    try {
      const fetchedUsers = await Users.find();
      return res.status(200).json({
        statusCode: 200,
        message: "success",
        data: fetchedUsers,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async getUserById(req, res) {
    try {
      const user = await Users.findById(req.params.id);
      if (!user) {
        return catchError(404, `User not found by ID ${id}`, res);
      }
      return res.status(200).json({
        statusCode: 200,
        message: "success",
        data: user,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async signIn(req, res) {
    try {
      const { gmail, password } = req.body;
      const user = await Users.findOne({ gmail });
      if (!user) {
        return catchError(404, "Gmail not found", res);
      }
      const matchPassword = await verifyPassword(password, user.password);
      if (!matchPassword) {
        return catchError(400, "Invalid password", res);
      }
      const otp = generateOTP();
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: "muhammadrasulshixnazarov@gmail.com",
        subject: "Users guard system",
        text: otp,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return catchError(500, `Error on sending to mail: ${err}`, res);
        } else if (info) {
          setCache(user.gmail, otp);
        }
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Otp sent to your gmail successfully",
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async confirmSignIn(req, res) {
    try {
      const { gmail, otp } = req.body;
      const user = await Users.findOne({ gmail });
      if (!user) {
        return catchError(404, "Gmail not found", res);
      }
      const otpCache = getCache(gmail);
      if (!otpCache || otp != otpCache) {
        return catchError(400, "Otp expired", res);
      }
      const payload = { id: user._id, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      writeToCookie(res, "refreshTokenUser", refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async getAccessToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenUser;
      if (!refreshToken) {
        return catchError(401, 'Refresh token not found', res);
      }
      const decodedData = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedData) {
        return catchError(401, 'Refresh token expire', res);
      }
      const payload = { id: decodedData.id, role: decodedData.role };
      const accessToken = generateAccessToken(payload);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  };

  async blockUser (req, res) {
    try {
        const { id } = req.params;

        const user = await Users.find(id);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        };
        if(user.status === 'blocked') {
            return res.status(400).json({ message: 'User already blocked '});
        };
        user.status = 'blocked';
        await user.save();

        return res.status(200).json({
            message: 'User blocked successfully',
            user
        });
    } catch (error) {
        return catchError(500, error.message, res);
    }
  };

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
  
      const deleted = await Users.findByIdAndDelete(id);
  
      if (!deleted) {
        return catchError(404,"User not found", res);
      }
  
      return res.status(200).json({
        message: "User deleted successfully",
      });
  
    } catch (error) {
      catchError(500, error.message, res)
    }
  }
  
}
