import dotenv from "dotenv";
import * as discord from "discord.js";
import { MessageButton, MessageActionRow } from "discord.js";
import fetch from "node-fetch";

dotenv.config();

const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES],
});

client.once("ready", () => {
    const serverChat = client.channels.cache.get(process.env.SERVER_CHAT_CHANNEL as string) as discord.TextChannel;

    const collector = serverChat.createMessageCollector({
        filter: (m) =>
            m.author.id === process.env.DISCORDSRV_USER &&
            (m.content === ":octagonal_sign: **Server has stopped**" || m.content === "🛑 **Server has stopped**"),
    });
    collector.on("collect", (m: discord.Message) => {
        m.reply({
            content: "**Start creative server?**",
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("start_server")
                        .setLabel("Start Creative Server")
                        .setStyle("SUCCESS"),
                ),
            ],
        });
    });

    client.on("interactionCreate", async (interaction) => {
        if (!(interaction.isButton() && interaction.customId === "start_server")) return;

        const response = await fetch(process.env.START_URL as string);

        if (response.status >= 200 && response.status < 300) {
            try {
                await interaction.reply({
                    content: `<@${interaction.member?.user.id}> Attempting to boot server, please wait...`,
                });
            } catch (err) {
                console.error(err);
            }
        }
    });
});

client.login(process.env.TOKEN);
