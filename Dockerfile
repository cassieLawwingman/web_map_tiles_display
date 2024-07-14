FROM node:latest

EXPOSE 1234

COPY ./ /wmts_tiles

WORKDIR /wmts_tiles
RUN npm install

CMD /bin/bash 
ENTRYPOINT npm start
