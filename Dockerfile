# Use Node.js LTS (Alpine) for a small footprint
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy application source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the server
CMD ["npm", "run", "server"]
