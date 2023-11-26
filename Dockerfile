FROM node:latest

EXPOSE 1234

COPY ./ /wmts_tiles

WORKDIR /wmts_tiles
CMD /bin/bash 
ENTRYPOINT npm start