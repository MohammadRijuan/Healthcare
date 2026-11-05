import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { seedSuperAdmin, seedTesterAdmin, seedTesterDoctor } from "./utils/seed";

const PORT = config.port;

async function main() {
	try {
		prisma.$connect();
		console.log("database connected");
		seedSuperAdmin();
		seedTesterAdmin();
		seedTesterDoctor();

		app.listen(PORT, () => {
			console.log(`Healthcare is connected on port ${PORT}`);
		});
	} catch (error) {
		console.log("database disconnected", error);
		prisma.$disconnect();

		process.exit();
	}
}

main();
