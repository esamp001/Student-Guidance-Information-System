const cron = require("node-cron");
const simpleGit = require("simple-git");
const git = simpleGit();

// Schedule every 10 seconds
cron.schedule(
  "*/10 * * * * *",
  async () => {
    const now = new Date().toLocaleString();
    console.log(`⏱️ Running auto commit at ${now}...`);

    try {
      const status = await git.status();

      if (status.files.length === 0) {
        console.log(`🟡 No changes detected at ${now}. Skipping commit.`);
        return;
      }

      await git.add(".");
      await git.commit(`Auto commit: ${now}`);
      await git.push("origin", "main");
      console.log(`✅ Auto commit & push done at ${now}`);
    } catch (error) {
      console.error(`❌ Error at ${now}`, error);
    }
  },
  {
    scheduled: true,
  }
);
