import { User, LoginDTO, RegisterDTO } from "./types.js";

// In-memory user storage (replace with database in production)
const userStore: Map<string, User> = new Map();

export class AuthService {
  static login(data: LoginDTO): { token: string; user: User } | undefined {
    // TODO: Implement real authentication with password verification
    const user = Array.from(userStore.values()).find(
      (u) => u.email === data.email
    );

    if (!user) return undefined;

    // Mock token generation
    const token = Buffer.from(JSON.stringify({ id: user.id })).toString(
      "base64"
    );
    return { token, user };
  }

  static register(data: RegisterDTO): User {
    const id = String(Date.now());
    const user: User = {
      id,
      email: data.email,
      name: data.name,
      createdAt: new Date(),
    };
    userStore.set(id, user);
    return user;
  }

  static getCurrentUser(userId: string): User | undefined {
    return userStore.get(userId);
  }
}
