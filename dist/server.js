"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const index_1 = __importDefault(require("./config/index"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
process.on("uncaughtException", (error) => {
    console.log(error);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, dbConnection_1.default)();
            server = app_1.default.listen(index_1.default.port, () => {
                console.log(`Application listening on port ${index_1.default.port}`);
            });
        }
        catch (error) {
            console.error(`failed to connect database`, error);
        }
        process.on("unhandledRejection", (error) => {
            if (server) {
                server.close(() => {
                    console.error(error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
main();
process.on("SIGTERM", () => {
    console.log("SIGTERM is received");
    if (server) {
        server.close();
    }
});
