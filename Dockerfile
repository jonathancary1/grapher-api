FROM node:alpine
WORKDIR /app/
ENV NODE_ENV=production PORT=80 HOST=::
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./ ./
RUN npm run build
EXPOSE 80
CMD npm run start
