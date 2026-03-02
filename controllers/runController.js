const { spawn } = require("child_process");

exports.runPython = (req, res) => {
  const python = spawn("python", ["runner/run.py"]);

  let output = "";
  let error = "";

  python.stdout.on("data", data => output += data);
  python.stderr.on("data", data => error += data);

  python.on("close", () => {
    if (error) {
      res.json({ error });
    } else {
      res.json({ output });
    }
  });

  python.stdin.write(req.body.code);
  python.stdin.end();
};