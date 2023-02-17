import { createServer } from "http";
import { promises as fs } from "fs";

const host = "localhost";
const port = 8000;

const requestListener = function (req, res) {
  fs.readFile("webapp/dist/index.html")
    .then(contents => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    })
    .catch(err => {
      res.writeHead(500);
      res.end(err);
    });
};

const server = createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
