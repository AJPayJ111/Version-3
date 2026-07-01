const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createHarness() {
  const storage = new Map();
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
    clear() { storage.clear(); }
  };
  const sessionStorage = {
    getItem(key) { return storage.has(`session:${key}`) ? storage.get(`session:${key}`) : null; },
    setItem(key, value) { storage.set(`session:${key}`, String(value)); },
    removeItem(key) { storage.delete(`session:${key}`); },
    clear() { for (const key of [...storage.keys()]) { if (key.startsWith('session:')) storage.delete(key); } }
  };

  const elements = new Map();
  const createElement = (id) => ({
    id,
    value: '',
    checked: false,
    textContent: '',
    style: {},
    className: '',
    innerHTML: '',
    disabled: false,
    appendChild() {},
    addEventListener() {},
    focus() {},
    setAttribute() {},
    removeAttribute() {},
    getContext() { return { fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, closePath() {}, arc() {}, fill() {}, measureText() { return { width: 0 }; }, fillText() {}, save() {}, restore() {}, translate() {}, scale() {}, setTransform() {}, rotate() {}, createLinearGradient() { return { addColorStop() {} }; }, createRadialGradient() { return { addColorStop() {} }; }, canvas: { width: 300, height: 150 } }; },
    classList: { add() {}, remove() {}, contains() { return false; } }
  });

  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement(id));
      return elements.get(id);
    },
    querySelectorAll() { return { forEach() {} }; },
    createElement() { return createElement(); },
    body: createElement('body')
  };

  const window = {
    addEventListener() {},
    confirm() { return true; },
    location: { href: '' }
  };

  const context = {
    window,
    document,
    localStorage,
    sessionStorage,
    console,
    Chart: function Chart() {
      return {
        destroy() {},
        update() {},
        clear() {},
        reset() {},
        resize() {},
        render() {},
        stop() {}
      };
    },
    FileReader: function FileReader() { this.onload = null; this.readAsDataURL = () => {}; },
    setTimeout,
    clearTimeout,
    Date
  };
  context.global = context;
  context.globalThis = context;
  context.self = context;

  const script = fs.readFileSync(path.join(__dirname, '..', 'thejava.js'), 'utf8');
  vm.createContext(context);
  vm.runInContext(script, context);

  return { context, elements, localStorage, sessionStorage };
}

test('register and login create an authenticated session', () => {
  const { context, elements, localStorage } = createHarness();

  const registerFields = [
    ['regUsername', 'demouser'],
    ['regEmail', 'demo.user@alphaload.test'],
    ['regPassword', 'AlphaDemo2026!'],
    ['regConfirmPassword', 'AlphaDemo2026!'],
    ['acceptTerms', true]
  ];
  registerFields.forEach(([id, value]) => {
    const el = elements.get(id) || context.document.getElementById(id);
    if (typeof value === 'boolean') {
      el.checked = value;
    } else {
      el.value = value;
    }
  });

  context.doRegister();

  const users = JSON.parse(localStorage.getItem('st_users'));
  assert.equal(users.length, 1);
  assert.equal(users[0].email, 'demo.user@alphaload.test');
  assert.equal(vm.runInContext('currentUserId', context), users[0].id);

  const loginFields = [
    ['loginIdentifier', 'demo.user@alphaload.test'],
    ['loginPassword', 'AlphaDemo2026!'],
    ['rememberMe', false]
  ];
  loginFields.forEach(([id, value]) => {
    const el = elements.get(id) || context.document.getElementById(id);
    if (typeof value === 'boolean') {
      el.checked = value;
    } else {
      el.value = value;
    }
  });

  context.doLogin();
  assert.equal(vm.runInContext('currentUserId', context), users[0].id);
});
