export class Stack<T> {
  private items: T[] = [];
  private readonly maxSize = 3;

  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift(); // Remove the first item
    }
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  get size(): number {
    return this.items.length;
  }
}
