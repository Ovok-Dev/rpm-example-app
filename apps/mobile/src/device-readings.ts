import type { DiaryEntry } from "./model";

export type ReadingInboxState = {
  entries: DiaryEntry[];
  busy: boolean;
};

export class ReadingInbox {
  private pending = new Map<string, DiaryEntry>();
  private saving = new Set<string>();
  private save: (entry: DiaryEntry) => Promise<void>;
  private changed: (state: ReadingInboxState) => void;

  constructor(
    save: (entry: DiaryEntry) => Promise<void>,
    changed: (state: ReadingInboxState) => void,
  ) {
    this.save = save;
    this.changed = changed;
  }

  async receive(entry: DiaryEntry): Promise<void> {
    this.pending.set(entry.id, entry);
    await this.retry(entry);
  }

  async retry(entry: DiaryEntry): Promise<void> {
    if (this.saving.has(entry.id)) return;
    this.saving.add(entry.id);
    this.publish();
    try {
      await this.save(entry);
      this.pending.delete(entry.id);
    } finally {
      this.saving.delete(entry.id);
      this.publish();
    }
  }

  private publish() {
    this.changed({
      entries: [...this.pending.values()],
      busy: this.saving.size > 0,
    });
  }
}
