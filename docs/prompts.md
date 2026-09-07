please meticulously review @AGENTS.md , @CLAUDE.md , @README.md and @nave-spire_SKILL.md to have a deep understanding of the project and its codebase design and architecture. Next, meticulously plan to validate your deep understanding against the codebase to check for alignment and to confirm the project status.

please meticulously proceed with your best recommendations

docker container for the postgres database is running. please meticulously proceed with database initialization, follow by testing.

please meticulously plan to create `nave-spire_SKILL.md` using skills 'distill-codebase-skill' and 'to-distill-project-into-skill'

please meticulously proceed to write the SKILL to ~/.pi/agent/skills/ with a more general description in the yaml header to facilitate other agents to discover it for similar projects in future

please meticulously add a script "db:setup" to package.json that will initialize the database from scratch (db generate && db migrate && db seed). goal is for the 'db:setup' script in package.json to be able to prepare the postgresql database for production from a fresh github repo cloning

please meticulously plan to create an end-to-end 'database initialization + package installation + application build + launching the application server in the background' shell script using `/Home1/project/programmer-blog/start_server.sh` as the template to adapt and modify accordingly to match the current codebase.
