FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Declare NEXT_PUBLIC_API_URL as a build-time argument
ARG NEXT_PUBLIC_API_URL

# Copy application code
COPY . .

# Set NEXT_PUBLIC_API_URL as an environment variable for the build process
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application with ESLint disabled
RUN NEXT_DISABLE_ESLINT=1 npm run build

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"] 