FROM node
RUN apt-get update

RUN apt-get install nginx -y
RUN npm install yarn
RUN mkdir -p /opt/twitch/

WORKDIR /opt/twitch/

RUN git clone https://github.com/lleadbet/developer-rig.git .
RUN sed -i '3,7d' scripts/configure
RUN sed -i '8,12d' scripts/make-cert
RUN ./scripts/make-cert; exit 0
RUN yarn; exit 0

COPY ./nginx/default /etc/nginx/sites-enabled/default

#3000:443
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "echo '127.0.0.1 localhost.rig.twitch.tv' >> /etc/hosts && service nginx start && yarn start"]
