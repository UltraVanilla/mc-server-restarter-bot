import dotenv from "dotenv";
import * as discord from "discord.js";
import { MessageButton, MessageActionRow } from "discord.js";
import fetch from "node-fetch";

dotenv.config();

const ROLE_WHITELIST = JSON.parse(process.env.ROLE_WHITELIST as string);
const ROLE_WHITELIST_ENABLED = (process.env.ROLE_WHITELIST_ENABLED as string) === "true";

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
        if (interaction.member == null) return;

        const roles = (interaction.member.roles as discord.GuildMemberRoleManager).cache;

        if (ROLE_WHITELIST_ENABLED && !Array.from(roles.keys()).some((role) => ROLE_WHITELIST.includes(role))) {
            await interaction.reply({
                content: `<@${interaction.member?.user.id}> You must be a member of UltraVanilla for 10 days to start the creative server. Ask @Staff for Loyalist role.`,
            });
        } else {
            const response = await fetch(process.env.START_URL as string);

            if (response.status >= 200 && response.status < 300) {
                await interaction.reply({
                    content: `<@${interaction.member?.user.id}> Attempting to boot server, please wait...`,
                });
            }
        }
    });
});

client.login(process.env.TOKEN);
