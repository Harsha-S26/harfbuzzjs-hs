const fs = require("fs");

function example(hb, fontBlob, text, metricsEnabled) {
  const blob = hb.createBlob(fontBlob);
  const face = hb.createFace(blob, 0);
  const font = hb.createFont(face);
  console.log(font);
  font.setScale(46, 46); // Optional, if not given will be in font upem

  const buffer = hb.createBuffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();

  // buffer.setDirection('ltr'); // optional as can be set by guessSegmentProperties also

  hb.shape(font, buffer); // features are not supported yet
  const result = buffer.json(text); /// ???????

  // returns glyphs paths, totally optional
  var glyphs = {};
  var pathTags = [];
  
  let cursorX = 0, cursorY = 0;
  result.forEach(function (glyph) {

    const xOffSet = glyph.dx;
    const yOffSet = glyph.dy;
    const xAdvance = glyph.ax;
    const yAdvance = glyph.ay;
    const d = font.glyphToPath(glyph.g);
    const pathTag = getPathTag(d, cursorX + xOffSet, cursorY + yOffSet);

    pathTags.push({
      pathTag,
    })

    cursorX += xAdvance;
    cursorY += yAdvance;

    if (glyphs[glyph.g]) return;
    glyphs[glyph.g] = {
      name: font.glyphName(glyph.g),
      path: font.glyphToPath(glyph.g),
      json: font.glyphToJson(glyph.g)
    };
  });

  const finalResult = { shape: result, glyphs: glyphs, pathTags };

  const wordSVG = getWordSVG(pathTags);

  createSVGFile(wordSVG);

  write("result.json", finalResult);
  var unicodes = face.collectUnicodes()

  buffer.destroy();
  font.destroy();
  face.destroy();
  blob.destroy();
  return { shape: result, glyphs: glyphs, unicodes: unicodes };
}

function getWordSVG(pathTags) {
  let wordSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="130" y="30" width="100%" height="100%" style="overflow:visible">`
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

function getPathTag(d, x, y) {
  return `<path transform="translate(${x} ${y})" d="${d}"/>`
}

function getCharBound(glyph, startPt) {

}

function write(file, data) {
  fs.writeFile("./outputs/" + file, JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
  })
}

// Should be replaced with something more reliable
try { module.exports = example; } catch(e) {}
