# Environment Variables Configuration

This application requires several environment variables to be set for secure operation. 

## Setup Instructions

1. Copy `.env.example` to `.env` (or set environment variables in your deployment environment)
2. Fill in all required values
3. **Never commit `.env` file to version control**

## Required Environment Variables

### Database
- `DB_URL` - MySQL database connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password (REQUIRED)

### Email Service
- `MAIL_HOST` - SMTP server hostname
- `MAIL_PORT` - SMTP server port
- `MAIL_USERNAME` - Email account username
- `MAIL_PASSWORD` - Email account password/app password (REQUIRED)

### JWT Security
- `JWT_SECRET` - Secret key for JWT token signing (REQUIRED, minimum 64 characters)
- `JWT_EXPIRATION_MS` - Access token expiration time in milliseconds (default: 86400000 = 24 hours)
- `JWT_REFRESH_EXPIRATION_MS` - Refresh token expiration time in milliseconds (default: 82800000 = 23 hours)

### Redis
- `REDIS_HOST` - Redis server hostname (default: localhost)
- `REDIS_PORT` - Redis server port (default: 6379)

### SMS API (Optional)
- `SMS_API_KEY` - Base64 encoded API key for SMS service
- `SMS_API_URL` - SMS API endpoint URL

## Security Notes

- All secrets should be stored securely and never committed to version control
- Use environment variables or a secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault)
- Generate strong, random values for `JWT_SECRET` (minimum 32 characters, 64+ recommended for production)
- Use application-specific passwords for email services (not your regular password)

## Development vs Production

**IMPORTANT**: The `application.properties` file contains default values for local development. These defaults are:
- **NOT SECURE** for production use
- Only intended to allow the application to start locally without configuration
- **MUST be overridden** in production using environment variables

For production deployments:
1. Set all required environment variables (especially `JWT_SECRET`, `DB_PASSWORD`, `MAIL_PASSWORD`)
2. Use strong, randomly generated secrets
3. Never commit production secrets to version control

## Running Locally

For local development, you can create a `.env` file in the `server` directory, or set environment variables before running:

```bash
export JWT_SECRET=your_secret_here
export DB_PASSWORD=your_password
# ... etc
```

Or use a tool like `dotenv` or Spring Boot's built-in support for `.env` files with additional configuration.

