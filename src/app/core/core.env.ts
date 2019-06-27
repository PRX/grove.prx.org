//
// DYNAMIC env variables
//

declare const window: any;

const DEFAULTS = {
  AUTH_HOST: 'id.prx.org',
  AUTH_CLIENT_ID: '3c027cfb956b2ba731149bbd934fc019d81fa0ae'
};

const addScheme = (name: string, value: any): any => {
  if (name.match(/_HOST$/) && value && !value.startsWith('http')) {
    const scheme = value.match(/.*\.prxu?\.(?:org|tech|dev)$/) ? 'https' : 'http';
    return `${scheme}://${value}`;
  } else {
    return value;
  }
};

const getVar = (name: string): any => {
  if (window && window.ENV && window.ENV[name] !== undefined) {
    return addScheme(name, window.ENV[name]);
  } else {
    return addScheme(name, DEFAULTS[name]);
  }
};

const getTruthy = (name: string): boolean => {
  if (window && window.ENV && window.ENV[name] !== undefined) {
    return [true, 'true', 1, '1'].indexOf(window.ENV[name]) > -1;
  } else {
    return DEFAULTS[name] || false;
  }
};

const getNumber = (name: string): number => {
  if (window && window.ENV && window.ENV[name] !== undefined) {
    const num = parseInt(window.ENV[name], 10);
    return isNaN(num) ? 0 : num;
  } else {
    return DEFAULTS[name] || 0;
  }
};

export class Env {
  public static get AUTH_HOST(): string { return getVar('AUTH_HOST'); }
  public static get AUTH_CLIENT_ID(): string { return getVar('AUTH_CLIENT_ID'); }
}
