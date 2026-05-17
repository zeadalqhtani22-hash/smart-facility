const axios = require("axios");

const db = require("./firebase");

const {
  ref,
  onValue,
  update
} = require("firebase/database");

const shellyDevices = {
  plug1: "192.168.0.33",
  plug2: "192.168.0.149",
  plug3: "192.168.0.160"
};

console.log("Local Shelly Controller Running...");

const commandsRef = ref(db, "commands");

onValue(commandsRef, async (snapshot) => {

  const commands = snapshot.val();

  if (!commands) return;

  for (const plug in commands) {

    const cmd = commands[plug];

    if (!cmd.pending) continue;

    try {

      const ip = shellyDevices[plug];

      await axios.get(
        "http://" +
        ip +
        "/rpc/Switch.Set?id=0&on=" +
        cmd.state
      );

      console.log(
        plug +
        " switched to " +
        cmd.state
      );

      await update(
        ref(db, "commands/" + plug),
        {
          pending: false
        }
      );

    } catch (error) {

      console.log(
        "Shelly Error:",
        error.message
      );

    }

  }

});