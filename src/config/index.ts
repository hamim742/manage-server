import "dotenv/config";

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5001,
  database_url: process.env.DATABASE_URL as string,
  password_salt: Number(process.env.PASSWORD_SALT) || 10,
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expire_in: process.env.JWT_EXPIRES_IN || "1d",
  },
  admin: {
    name: process.env.ADMIN_NAME || "Super Admin",
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "admin123456",
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

