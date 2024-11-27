import crypto from "crypto";

class Service {
  async hash(payload: string) {
    return crypto
      .createHmac("sha256", process.env.HASH_SECRET as string)
      .update(payload)
      .digest("hex");
  }

  async compare(payload: string, hash: string) {
    return (
      crypto
        .createHmac("sha256", process.env.HASH_SECRET as string)
        .update(payload)
        .digest("hex") === hash
    );
  }
}

export const HashPassword = new Service();
