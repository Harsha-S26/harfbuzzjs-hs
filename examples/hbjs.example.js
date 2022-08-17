const fs = require("fs");

function example(hb, fontBlob, text) {
  var blob = hb.createBlob(fontBlob);
  var face = hb.createFace(blob, 0);
  // console.log(face.getAxisInfos());
  var font = hb.createFont(face);
  // font.setVariations({ wdth: 200, wght: 700 });
  font.setScale(1000, 1000); // Optional, if not given will be in font upem

  var buffer = hb.createBuffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  // buffer.setDirection('ltr'); // optional as can be set by guessSegmentProperties also
  hb.shape(font, buffer); // features are not supported yet
  var result = buffer.json(font);

  // returns glyphs paths, totally optional
  var glyphs = {};
  var pathTags = [];
  
  result.forEach(function (x) {

    const d = font.glyphToPath(x.g);
    const pathTag = getPathTag(d, { fill: 'black', stroke: 'none' });
    pathTags.push({
      pathTag,
    })

    if (glyphs[x.g]) return;
    glyphs[x.g] = {
      name: font.glyphName(x.g),
      path: font.glyphToPath(x.g),
      json: font.glyphToJson(x.g)
    };
  });

  const finalResult = { shape: result, glyphs: glyphs, pathTags };

  const wordSVG = getWordSVG(pathTags);

  createSVGFile(wordSVG);

  write("result.json", finalResult);

  buffer.destroy();
  font.destroy();
  face.destroy();
  blob.destroy();
  return { shape: result, glyphs: glyphs };
}

function getWordSVG(pathTags) {
  let wordSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="100%" height="100%" style="overflow:visible">`
  pathTags.forEach((p) => {
    wordSVG += p.pathTag
  })
  wordSVG += '</svg>';

  return wordSVG;
}

function createSVGFile(wordSVG) {
  let logger = fs.createWriteStream('./rendered.svg', {
    flags: 'w'
  })

  logger.write(wordSVG);
  logger.end();
}

function getPathTag(d, attributes = {}) {
  return `<path d="${d}"/>`
}

function write(file, data) {
  fs.writeFile("./outputs/" + file, JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
  })
}

// Should be replaced with something more reliable
try { module.exports = example; } catch(e) {}
