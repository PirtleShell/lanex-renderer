'use strict'
const should = require('chai').should();
const renderer = require('../src');

describe('links', () => {
  describe('when relative', () => {
    it('render in <Link/>', function() {
      const md = `[relative link](/a/relative/link)`;
      const expected = '<p><Link to="/a/relative/link">relative link</Link></p>\n';
      renderer.render(md).should.equal(expected);
    });
  });

  describe('when absolute', () => {
    it('render in <a> when absolute', function() {
      const md = `[absolute link](http://domain.com/elsewhere)`;
      const expected = '<p><a href="http://domain.com/elsewhere">absolute link</a></p>\n';
      renderer.render(md).should.equal(expected);
    });
  });

  describe('mailto:', () => {
    it('renders as absolute', function() {
      const md = `[email me!](mailto:anEmail@website.com)`;
      const expected = '<p><a href="mailto:anEmail@website.com">email me!</a></p>\n';
      renderer.render(md).should.equal(expected);
    })
  })
});

describe('highlight', () => {
  it('escapes curly brackets properly', function() {
    const md = '``` js\nconst magic = \'hello\'\nif(magic) {\nconsole.log(\'whattup\')\n}\n```\n';
    const html = [
      `<pre><code class="language-js"><span class="hljs-keyword">const</span> magic = <span class="hljs-string">'hello'</span>`,
      `<span class="hljs-keyword">if</span>(magic) {\'{\'}`,
      `<span class="hljs-built_in">console</span>.log(<span class="hljs-string">'whattup'</span>)`,
      '{\'}\'}',
      `</code></pre>\n`
    ].join('<br/>');
    renderer.render(md).should.equal(html);
  });
});

describe('special containers', () => {

  describe('under-construction', () => {
    it('shoud render the under construciton box', function() {
      const expected = [
        '<div class=\'panel panel-warning under-construction\'>',
        '  <div class=\'panel-heading\'>Under Construction</div>',
        '  <div class=\'panel-body\'>',
        '    This page is unfinished. Check back soon as more words, images and magic make their way in. But feel free to look around. More information about the project can be found <a href=\'about-laniakean-explorer\'>here</a>. The current focus is on data collection and <a href=\'/api\'>building an API</a> for easily accessing data used in this project.',
        '  </div>',
        '</div>'
      ].join('\n');
      renderer.render('::: under-construction :::').should.equal(expected);
    });
  });

  describe('render', function() {
    it('should preserve contents without a paragraph', function() {
      const jsx = '<SomeJSX with={attributes} and="stuff" />';
      const md = `@@@\n${jsx}\n@@@\n`;
      renderer.render(md).should.equal(jsx + '\n');
    });

    it('parses with indents', function() {
      const jsx = [
        "<Image",
        "	title='The Hubble XDF'",
        "	image='/images/hubble-extreme-deep-field.jpg'",
        "	bigImage='/images/hubble-extreme-deep-field-full.jpg'",
        "	alt='A section of the Hubble Extreme Deep Field, the image of the most distant galaxies ever captured.'",
        "	caption='A section of the Hubble Extreme Deep Field in UV-vis-IR light, the most distant galaxies ever pictured. This section is the upper middle left of the full-size image. Image credit: NASA, ESA, G. Illingworth, D. Magee, and P. Oesch (University of California, Santa Cruz), R. Bouwens (Leiden University), and the HUDF09 Team.'",
        "/>"
      ].join('\n');

      const html = [
        "<p>This is a paragraph</p>",
        jsx,
        '<p>This is another paragraph</p>\n'
      ].join('\n');
      const md = `This is a paragraph\n\n@@@\n${jsx}\n@@@\n\nThis is another paragraph\n`;
      renderer.render(md).should.equal(html);
    });
  });
});

describe('tables', () => {
  it('style attr renders properly', function() {
    const md = [
      '|hello|hi|',
      '|:-----|:--:|',
      '|sup  |nada|'
    ].join('\n')
    // const md = [
    //   `\| Live? \| Option \| Description \|`,                                             |
    //   `\|:------\|:-------\|:------------\|`,
    //   `\| ✓     \| blah   \| blah blah   \|`
    // ].join('\n');
    const html = [
      '<table className="table table-responsive" style={{width: "auto"}}><thead>',
      '<tr>',
      '<th style={{"textAlign":"left"}}>hello</th>',
      '<th style={{"textAlign":"center"}}>hi</th>',
      '</tr>',
      '</thead>',
      '<tbody>',
      '<tr>',
      '<td style={{"textAlign":"left"}}>sup</td>',
      '<td style={{"textAlign":"center"}}>nada</td>',
      '</tr>',
      '</tbody>',
      '</table>\n'
    ].join('\n');
    renderer.render(md).should.equal(html)
  })
})
