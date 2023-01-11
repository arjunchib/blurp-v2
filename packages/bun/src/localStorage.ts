import { Database } from "bun:sqlite";

declare global {
  var localStorage: Storage;
}

class Storage {
  private db?: Database;
  setItem(key: string, value: string): void {
    if (!this.db) {
      this.db = new Database("localStorage.sqlite", { create: true });
      this.db.run(
        "CREATE TABLE IF NOT EXISTS store (key STRING PRIMARY KEY, value TEXT)"
      );
    }
    this.db.run("INSERT INTO store VALUES (?, ?)", key, value);
  }
  getItem(key: string): string | null {
    if (!this.db) {
      return null;
    }
    const result = this.db
      .query("SELECT value FROM store WHERE key = ?")
      .get(key);
    return result[0].value;
  }
  removeItem(key: string): void {
    if (!this.db) return;
    this.db.run("DELETE FROM store WHERE key = ?", key);
  }
  clear(): void {
    this.db.run("TRUNCATE TABLE store");
  }
}

globalThis.localStorage = new Storage();
