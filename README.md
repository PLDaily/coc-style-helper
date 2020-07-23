# coc-style-helper

Write styles easier in JSX, provide a powerful auxiliary development functions in style files like CSS, SASS, forked from [Iceworks Style Helper](https://github.com/ice-lab/iceworks/blob/master/extensions/iceworks-style-helper/README.en.md)

## Install

`:CocInstall coc-style-helper`

## Features

### JSX inline style automatic completion

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/jsx-style-automatic-completion.gif" alt="jsx-style-automatic-completion.gif">

### JSX style variable assignment

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/jsx-style-variable-assignment.gif" alt="jsx-style-variable-assignment.gif">

### JSX classname automatic completion

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/jsx-classname-automatic-completion.gif" alt="jsx-classname-automatic-completion.gif">

### JSX classname value preview and define jump

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/jsx-classname-value-preview-and-define-jump.gif" alt="jsx-classname-value-preview-and-define-jump.gif">

### Css classname automatic completion

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/css-classname-automatic-classname.gif" alt="css-classname-automatic-classname.gif">

### Scss/Sass automatic completion

<img src="https://raw.githubusercontent.com/PLDaily/coc-style-helper/master/images/sass-automatic-completion.gif" alt="sass-automatic-completion.gif">


## Usage

```
" GoTo code navigation.
nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gi <Plug>(coc-implementation)
nmap <silent> gr <Plug>(coc-references)

" Use K to show documentation in preview window.
nnoremap <silent> K :call <SID>show_documentation()<CR>

function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  else
    call CocAction('doHover')
  endif
endfunction
```

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
