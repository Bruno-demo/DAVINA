FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli@17 && npm install

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
