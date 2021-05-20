import {SessionKeys} from '../types/enums';

class SessionStorage {

  ss = sessionStorage;

  constructor() {
  }

  set(key: SessionKeys, value: any): void {
    if (typeof value !== 'string') {
      this.ss.setItem(key, JSON.stringify(value));
      return;
    }
    this.ss.setItem(key, value);
  }

  get(key: SessionKeys): null | string {
    let data = this.ss.getItem(key);
    try {
      if (data) {
        data = JSON.parse(data);
        return data;
      }
      return null;
    } catch (e) {
      return data;
    }
  }
}

export {
  SessionKeys,
  SessionStorage
};
