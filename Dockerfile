FROM xiaohui/node

RUN apt-get update && apt-get install -y vim wget
RUN mkdir /workspace
   
COPY ./server /workspace/server/
EXPOSE 80 3000

WORKDIR /workspace/server
CMD ["npm start"]