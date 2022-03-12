import blessed from 'blessed'

import reactBlessed from 'react-blessed'

import React from 'react'

// js.blessed/createScreen [101] 
function createScreen(title,options){
  const s = blessed.screen(Object.assign({
    "smartCSR":true,
    "dockBorders":true,
    "autoPadding":true,
    "cursor":{
        "artificial":true,
        "shape":{"bg":"yellow","fg":"white","bold":true},
        "blink":true
      },
    "debug":true,
    "title":title,
    "sendFocus":true,
    "useBCE":true,
    "grabKeys":true
  },options));
  s.key(["q","C-c","Esc"],function (){
    this.destroy();
  });
  return s;
}

// js.blessed/run [126] 
function run(element,title,options){
  reactBlessed.render(element,createScreen(title,options));
}

var MODULE = {"createScreen":createScreen,"run":run};

export default MODULE