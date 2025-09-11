# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port (change if your app runs on a different port)
EXPOSE 3000

# Run your npm script
CMD ["npm", "run", "dev"]
