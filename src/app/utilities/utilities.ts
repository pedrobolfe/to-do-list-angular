
export class Utilities{

  static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
