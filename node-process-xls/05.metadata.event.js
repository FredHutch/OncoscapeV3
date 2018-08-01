const api = require('./api.js');
const files = api.io.readDir('output').filter(v => v.indexOf('event-') === 0);

// Loop Through Matrix Files
files.forEach(file => {
  const tab = file.substr(0, file.length - 4);
  const eventData = api.io.readCsv('output', file);
  const cols = eventData.shift().map(v => v.toLowerCase().trim());

  const startIndex = cols.indexOf('start');
  const endIndex = cols.indexOf('end');

  // Verify Column Star + End Exists
  if (startIndex === -1) {
    api.log.error('Required Column Missing: Start', tab);
    api.term();
  }
  if (endIndex === -1) {
    api.log.error('Required Column Missing: End', tab);
    api.term();
  }

  eventData.map(v => {
    const start = v[startIndex]
      .toString()
      .toLowerCase()
      .trim();
    const end = v[startIndex]
      .toString()
      .toLowerCase()
      .trim();
    if (!isNaN(start)) {
      api.log.error('Omitting Event Start Is Not A Number', tab);
    }
    if (!isNaN(end)) {
      api.log.error('Omitting Event End Is Not A Number', tab);
    }
    if (start === '') {
      api.log.error('Omitting Event Start Value Required', tab);
    }
    if (end === '') {
      api.log.warn('Setting Event End Value To Start Value', tab);
    }
  });
});
