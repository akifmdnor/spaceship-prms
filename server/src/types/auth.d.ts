declare module "express-serve-static-core" {
  interface Request {
    /** Set by auth middleware after JWT or test X-User-Id */
    authUserId?: string;
  }
}

export {};
