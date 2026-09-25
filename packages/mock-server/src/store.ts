export class MockStore {
  private store = new Map<string, Array<Record<string, any>>>();

  public getCollection(resourceName: string, seedGenerator: () => any): any[] {
    if (!this.store.has(resourceName)) {
      const initialItems: any[] = [];
      for (let i = 0; i < 5; i++) {
        const item = seedGenerator() || {};
        // Ensure every generated item has a unique string ID
        initialItems.push({
          id: item.id || crypto.randomUUID(),
          ...item,
        });
      }
      this.store.set(resourceName, initialItems);
    }
    return this.store.get(resourceName) || [];
  }

  public create(
    resourceName: string,
    body: any,
    seedGenerator: () => any,
  ): any {
    const list = this.getCollection(resourceName, seedGenerator);
    const newItem = {
      id: body.id || crypto.randomUUID(),
      ...body,
    };
    list.push(newItem);
    return newItem;
  }

  public update(
    resourceName: string,
    id: string,
    body: any,
    seedGenerator: () => any,
  ): any | null {
    const list = this.getCollection(resourceName, seedGenerator);
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;

    list[index] = { ...list[index], ...body, id: list[index].id };
    return list[index];
  }

  public delete(
    resourceName: string,
    id: string,
    seedGenerator: () => any,
  ): boolean {
    const list = this.getCollection(resourceName, seedGenerator);
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    return true;
  }
}
