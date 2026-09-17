const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "EMAIL_USER",
  "EMAIL_PASS",
];
const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;
