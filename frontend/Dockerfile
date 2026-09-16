# Stage 1: Development stage
FROM node:18-alpine as development
WORKDIR /templefrontend

COPY package.json .
RUN npm install

COPY . .

# Stage 2: Build stage
FROM development as build

RUN npm run build

# Stage 3: Production stage
FROM node:18-alpine as production

WORKDIR /templefrontend

COPY --from=build /templefrontend/dist ./dist
COPY package.json .

RUN npm install -g http-server
#RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "start"]
