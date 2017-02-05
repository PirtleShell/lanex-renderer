# lanex-renderer

The markdown-it renderer used by [Laniakean.com](https://laniakean.com/).

## What

This renderer is used in a webpack markdown loader to render markdown files into React components. It has the following features:

* preserve contents in blocks fenced with `@@@`, useful for containing react components
* escapes code blocks so that `{` and `}` are replaced with `{'{'}` and `{'}'}`
* tables open with class `table table-responsive`
* style tags are replaces with a React-acceptable JSON string of styling
* relative links are rendered with `Link` instead of a regular `a`
* some custom inputs...

It uses the following plugins:
* markdown-it-math
* markdown-it-attrs
* markdown-it-abbr
* markdown-it-footnote
* markdown-it-ins
* markdown-it-sub
* markdown-it-sup
* markdown-it-emoji
* markdown-it-container
* markdown-it-deflist
* markdown-it-table-of-contents
* markdown-it-anchor

## Test

```sh
$ npm test

links
  when relative
    ✓ render in <Link/>
  when absolute
    ✓ render in <a> when absolute
  mailto:
    ✓ renders as absolute

highlight
  ✓ escapes curly brackets properly

special containers
  under-construction
    ✓ shoud render the under construciton box
  render
    ✓ should preserve contents without a paragraph
    ✓ parses with indents

tables
  ✓ style attr renders properly

8 passing (75ms)
```

## License

This is by [Robert Pirtle](https://pirtle.xyz). Its license is [MIT](https://choosealicense.com/licenses/mit/)
