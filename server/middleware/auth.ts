import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "coinkriazy_jwt_secret_2024";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    is_staff: boolean;
  };
}

export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function requireStaff(req: any, res: any, next: any) {
  if (!req.user?.is_admin && !req.user?.is_staff) {
    return res.status(403).json({ message: "Staff access required" });
  }
  next();
}
