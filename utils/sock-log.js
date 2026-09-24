const listeners = [];

export function onSockLog(fn) {
  listeners.push(fn);
}

export function sockLog(msg) {
  const line = String(msg);
  console.log(line);
  listeners.forEach((fn) => {
    try {
      fn(line);
    } catch (e) {}
  });
}
