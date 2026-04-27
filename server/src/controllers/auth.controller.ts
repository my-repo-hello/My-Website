import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/token';
import { generateOTP, isOTPExpired, getOTPExpiryDate } from '../utils/otp';
import { sendOTPEmail } from '../utils/email';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      res.status(400).json({ message: `${field} already exists` });
      return;
    }

    const user = new User({
      username,
      email,
      password,
      displayName: username,
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;

    await user.save();
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'No refresh token' });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    }
    clearTokenCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'No account with that email' });
      return;
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: getOTPExpiryDate(),
    };
    await user.save();
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.otp?.code || user.otp.code !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (isOTPExpired(user.otp.expiresAt)) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    res.json({ message: 'OTP verified', verified: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.otp?.code || user.otp.code !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (isOTPExpired(user.otp.expiresAt)) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    user.password = newPassword;
    user.otp = { code: '', expiresAt: new Date(0) };
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const exists = await User.findOne({ email: email.toLowerCase() });
    res.json({ exists: !!exists });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
