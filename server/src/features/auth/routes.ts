import { Router, Request, Response } from "express";
import { AuthService } from "./service.js";
import { LoginDTO, RegisterDTO } from "./types.js";

const router = Router();

// Register
router.post("/register", (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const data: RegisterDTO = { email, password, name };
    const user = AuthService.register(data);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const data: LoginDTO = { email, password };
  const result = AuthService.login(data);

  if (!result) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
});

// Get current user
router.get("/me", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // TODO: Verify token and extract userId
  res.json({ message: "User profile endpoint" });
});

export default router;
