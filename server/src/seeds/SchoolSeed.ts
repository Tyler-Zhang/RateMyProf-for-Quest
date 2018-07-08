import { School } from "../models";

export class SchoolSeed {
  public async run() {
    const documents = this.getDocuments();

    await Promise.all(documents.map(this.upsert));
  }

  private upsert = async (doc: any) => {
    const existing = await School.findOne({
      where: {
        name: doc.name
      }
    });

    if (!existing) {
      await School.create({ name: doc.name }).save();
    }
  }

  private getDocuments() {
    return [
      {
        name: 'University of Waterloo'
      }
    ];
  }
}
