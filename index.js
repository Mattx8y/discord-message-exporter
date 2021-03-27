const {Console} = require("console");
const {createWriteStream} = require("fs");

const {Client} = require("discord.js");
const ProgressBar = require("progress");

const fileStream = createWriteStream(process.argv[4]);
const fileWriter = new Console(fileStream);

/**
 * @type {ProgressBar}
 */
let bar;

/**
 * @type {string}
 */
let lastID;

/**
 * @type {module:"discord.js".Guild}
 */
let guild;

const client = new Client();

function search() {
    let options = {
        sortOrder: "asc",
        nsfw: true
    };
    if (lastID) options.minID = lastID;
    guild.search(options).then(result => {
        let messages = result.messages.flat();
        if (!lastID) bar = new ProgressBar("exporting [:bar] :current/:total (:percent) :etas remain", {
            complete: "=",
            incomplete: " ",
            width: 20,
            total: result.totalResults
        });
        for (let message of messages) {
            fileWriter.log("%s (%s): %s", message.author.tag, message.author.id, message.content);
            bar.tick();
            if (bar.complete) break;
        }
        if (!bar.complete) {
            lastID = messages[messages.length - 1].id;
            search();
        } else {
            client.destroy().catch(console.error);
        }
    });
}

client.login(process.argv[2]).catch(console.error);
client.once("ready", async () => {
    guild = client.guilds.get(process.argv[3]);
    search();
});