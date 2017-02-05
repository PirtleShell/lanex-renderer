'use strict';

const Markdown = require('markdown-it');
const urlRegex = require('url-regex');
const inlineStyleObj = require('inline-style-2-json');
const camelKeys = require('camelcase-keys');
const hljs = require('highlight.js');
const texzilla = require('texzilla');

// markdown plugins
const math = require('markdown-it-math');
const attrs = require('markdown-it-attrs');
const abbr = require('markdown-it-abbr');
const footnote = require('markdown-it-footnote');
const ins = require('markdown-it-ins');
const sub = require('markdown-it-sub');
const sup = require('markdown-it-sup');
const emoji = require('markdown-it-emoji');
const container = require('markdown-it-container');
const deflist = require('markdown-it-deflist');
const toc = require('markdown-it-table-of-contents');
const anchor = require('markdown-it-anchor');


// custom containers
const underConstruction = {
  validate: params => {
    return params.trim().match(/^under-construction/);
  },

  render: (tokens, idx) => {
    const out = [
      '<div class=\'panel panel-warning under-construction\'>',
      '  <div class=\'panel-heading\'>Under Construction</div>',
      '  <div class=\'panel-body\'>',
      '    This page is unfinished. Check back soon as more words, images and magic make their way in. But feel free to look around. More information about the project can be found <a href=\'about-laniakean-explorer\'>here</a>. The current focus is on data collection and <a href=\'/api\'>building an API</a> for easily accessing data used in this project.',
      '  </div>',
      '</div>'
    ].join('\n');
    if (tokens[idx].nesting === 1) {
      return out;
    }
    return '';
  }
};

const headingFilter = heading => {
  if (heading[heading.length - 1] === ':') {
    return heading.substr(0, heading.length - 1);
  }
  return heading;
};

const md = new Markdown({
  html: true,
  xhtmlOut: true,
  // linkify: true,
  typographer: true,
  quotes: '“”\'\''
})
  .use(math, {
    inlineRenderer: str => {
      return texzilla.toMathMLString(str);
    },
    blockRenderer: str => {
      return texzilla.toMathMLString(str, true);
    }
  })
  .use(attrs)
  .use(abbr)
  .use(footnote)
  .use(ins)
  .use(sub)
  .use(sup)
  .use(emoji)
  .use(container, 'under-construction', underConstruction)
  // .use(container, 'render', preserveReactContents)
  .use(require('./fence_modify'))
  .use(deflist)
  .use(anchor)
  .use(toc, {
    includeLevel: [2, 3],
    format: headingFilter,
    skipHeadings: ['Table of Contents']
  });

const escapeIt = str => {
  const escapeMap = {
    '{': '{\'{\'}',
    '}': '{\'}\'}'
  };
  str = str.replace(/{|}/g, match => {
    return escapeMap[match]
  });
  return str.replace(/\n/g, '<br/>')
};

// highlight and inline code needs to escape '{' and '}'
const highlight = (str, lang) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return escapeIt(hljs.highlight(lang, str).value);
    } catch (__) {}
  }
  return ''; // use external default escaping
};
md.options.highlight = highlight;

md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
  var token = tokens[idx];

  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeIt(md.utils.escapeHtml(tokens[idx].content)) +
          '</code>';
}



// add 'table table-responsive' class to tables.
md.renderer.rules.table_open = function () {
  return '<table className="table table-responsive" style={{width: "auto"}}>';
};

// relative links render in a <Link>
const defaultRender = (tokens, idx, options, env, self) => {
  return self.renderToken(tokens, idx, options);
};
// opening Link tag
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('href');
  if (aIndex < 0) {
    throw new TypeError('Link contains no href.');
  }
  const href = tokens[idx].attrs[aIndex][1];

  // check if link is relative, change it if it is
  if (!urlRegex({exact: true}).test(href) && href.indexOf('mailto:') !== 0) {
    tokens[idx].tag = 'Link';
    tokens[idx].attrs[aIndex] = ['to', href];
    env.inLink = true;
  }
  return defaultRender(tokens, idx, options, env, self);
};

// closing Link tag
md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
  if (env.inLink) {
    tokens[idx].tag = 'Link';
    delete env.inLink;
  }
  return defaultRender(tokens, idx, options, env, self);
};

// table styles to objects
md.renderer.rules.th_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('style');

  if (aIndex >= 0) {
    const style = camelKeys(inlineStyleObj(tokens[idx].attrs[aIndex][1]));
    return `<th style={${JSON.stringify(style)}}>`
  }
  return defaultRender(tokens, idx, options, env, self);
};

md.renderer.rules.td_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('style');

  if (aIndex >= 0) {
    const style = camelKeys(inlineStyleObj(tokens[idx].attrs[aIndex][1]));
    return `<td style={${JSON.stringify(style)}}>`
  }
  return defaultRender(tokens, idx, options, env, self);
};

module.exports = md;
