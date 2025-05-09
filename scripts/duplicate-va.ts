import readline from "readline";
import { Client } from "pg";

// Interactive prompt setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));


const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL is not set in the environment variables.");
    process.exit(1);
}

if (databaseUrl.includes("supabase.co")) {
    console.warn("You are connected to the production database. Are you sure you want to continue?");
    const answer = await prompt("Type 'yes' to continue: ");
    if (answer.toLowerCase() !== "yes") {
        console.log("Operation aborted.");
        process.exit(0);
    }
}

// Database connection setup
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main(): Promise<void> {
    const dryRun = process.argv.includes("--dry-run");
    try {
        await client.connect();
        console.log(`Connected to the database. Dry run mode: ${dryRun}\n`);
        
        // Ensure the unaccent extension is available
        await client.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
        
        // Fetch potential duplicates ignoring case and accents using PostgreSQL's unaccent
        const dupResult = await client.query<{ ids: number[] }>(`
            SELECT array_agg(id) AS ids
            FROM voice_actors
            GROUP BY lower(unaccent(firstname)), lower(unaccent(lastname))
            HAVING COUNT(*) > 1;
        `);
        
        for (const row of dupResult.rows) {
            const { ids } = row;
            const choices: number[] = [];
            for (const id of ids) {
                const details = await client.query<{ firstname: string, lastname: string }>(
                    "SELECT firstname, lastname FROM voice_actors WHERE id = $1",
                    [id]
                );
                const actor = details.rows[0];
                console.log(`[${id}] - ${actor.firstname} ${actor.lastname}`);
                choices.push(parseInt(id, 10));
            }
            
            const chosenId = parseInt(await prompt("Enter the ID of the actor you want to keep: "), 10);
            if (!choices.includes(chosenId)) {
                console.log("Invalid choice. Skipping this group.\n");
                continue;
            }
            
            // Use a transaction for safe updates
            try {
                if (!dryRun) {
                    await client.query("BEGIN");
                    await client.query(
                        `UPDATE work SET voice_actor_id = $1 WHERE voice_actor_id = ANY($2)`,
                        [chosenId, ids.filter(id => id !== chosenId)]
                    );
                    await client.query(
                        `DELETE FROM voice_actors WHERE id = ANY($1) AND id != $2`,
                        [ids, chosenId]
                    );
                    await client.query("COMMIT");
                    console.log(`Merged duplicates into ID ${chosenId} and cleaned up references.\n`);
                } else {
                    console.log(`Dry run: Would have merged into ID ${chosenId} and deleted other IDs.\n`);
                }
            } catch (transactionError) {
                await client.query("ROLLBACK");
                console.error("Transaction failed. Rolled back changes. Error:", transactionError);
            }
        }
        console.log("All duplicates resolved.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        rl.close();
        await client.end();
        console.log("Disconnected from the database.");
    }
}

main();