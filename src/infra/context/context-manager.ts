import { Injectable } from '@nestjs/common';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';

@Injectable()
export class ContextManagerService {
  private readonly namespace: Namespace;
  constructor() {
    const namespaceName = 'session';
    this.namespace = getNamespace(namespaceName) || createNamespace(namespaceName);
  }

  setContext<T>(key: string, value: T): void {
    this.namespace.run(() => {
      this.namespace.set(key, value);
    });
  }

  getContext<T>(key: string): T | undefined {
    return this.namespace.get(key);
  }
}
