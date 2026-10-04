const fs = require('fs');
const path = require('path');

function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  } else if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    const langCodes = ['bg','br','cn','de','es','fi','fr','hu','it','jp','ko','nb','nl','pl','ua'];
    const hasLangs = keys.some(k => langCodes.includes(k));

    if (hasLangs) {
      const res = {};
      if (obj.en !== undefined) res.en = obj.en;
      if (obj.ru !== undefined) res.ru = obj.ru;
      return res;
    }

    const res = {};
    for (const k of keys) {
      res[k] = cleanObject(obj[k]);
    }
    return res;
  }
  return obj;
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (file.endsWith('.json')) {
      try {
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        const cleaned = cleanObject(data);
        fs.writeFileSync(full, JSON.stringify(cleaned, null, '\t') + '\n', 'utf8');
        console.log('Очищен:', full);
      } catch (e) {
        console.error('Ошибка в файле:', full, e.message);
      }
    }
  }
}

['src/locales', 'src/genfiles'].forEach(processDir);
console.log('Все лишние языки удалены!');