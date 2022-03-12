import nodeUtil from 'util'

import React from 'react'

import b from './js/blessed'

// play.tui-003-sensor.main/useActuation [11] 
function useActuation({
  onActive,
  onIndicator,
  hold,
  initial = false,
  interval = 20,
  speed = 3,
  resolution = 1000
}){
  let clear = React.useRef();
  let [active,setActive] = React.useState(initial);
  React.useEffect(function (){
    if(onActive){
      onActive(null || active);
    }
  },[active]);
  let [indicator,setIndicator] = React.useState(active ? resolution : 0);
  React.useEffect(function (){
    if(onIndicator){
      onIndicator(indicator / resolution);
    }
  },[active,indicator]);
  React.useEffect(function (){
    if(hold){
      clear.current = null;
    }
    else if((indicator < resolution) && active){
      let tmr = setTimeout(function (){
        new Promise(function (){
          setIndicator(
            indicator + Math.ceil(Math.sqrt(resolution - indicator) * speed)
          );
        });
      },interval);
      clear.current = function (){
        clearInterval(tmr);
      };
      return clear.current;
    }
    else if((indicator > 0) && !active){
      let tmr = setTimeout(function (){
        new Promise(function (){
          setIndicator(indicator - Math.ceil(Math.sqrt(indicator) * speed));
        });
      },interval);
      clear.current = function (){
        clearInterval(tmr);
      };
      return clear.current;
    }
    else{
      clear.current = null;
    }
  },[active,indicator]);
  return [active,setActive,indicator,setIndicator,clear];
}

// play.tui-003-sensor.main/Switch [65] 
function Switch({disabled,onIndicator,onSelected,paramsIndicator,selected,textOff,textOn}){
  paramsIndicator = (paramsIndicator || {"interval":20,"speed":3,"resolution":1000});
  let [__selected,__setSelected] = useActuation(Object.assign({
    "active":selected,
    "onActive":onSelected,
    "onIndicator":onIndicator,
    "initial":selected
  },paramsIndicator));
  return (
    <button
      shrink={true}
      mouse={true}
      onClick={function (e){
        __setSelected(!__selected);
      }}
      content={__selected ? textOn : textOff}>
    </button>);
}

// play.tui-003-sensor.main/Pressure [92] 
function Pressure({disabled,onPressed,onPressure,paramsPressure,pressed,textPressed,textReleased}){
  paramsPressure = (paramsPressure || {"interval":20,"speed":3,"resolution":1000});
  let [__pressed,__setPressed] = useActuation(Object.assign({
    "active":selected,
    "onActive":onPressed,
    "onIndicator":onPressure,
    "initial":pressed
  },paramsPressure));
  return (
    <button
      shrink={true}
      mouse={true}
      onMouse={function (e){
        if(e.button == "left"){
          if((e.action == "mouseup")){
            __setPressed(false);
          }
          else{
            __setPressed(true);
          }
        }
      }}
      content={__pressed ? textPressed : textReleased}>
    </button>);
}

// play.tui-003-sensor.main/MenuToggle [125] 
function MenuToggle({disabled,onIntensity,onPressed,onSelected,paramsIndicator,paramsPressure,pressed,selected,text}){
  let ref = React.useRef();
  paramsPressure = Object.assign({"interval":50,"speed":6,"resolution":1000},paramsPressure);
  paramsIndicator = Object.assign({"interval":50,"speed":6,"resolution":1000},paramsIndicator);
  let [__intensity,__setIntensity] = React.useState(selected ? 1 : 0);
  React.useEffect(function (){
    if(onIntensity){
      onIntensity(null || __intensity);
    }
  },[__intensity]);
  let [__pressed,__setPressed,__pressure,__setPressure,__stopPressure] = useActuation(
    Object.assign({"onActive":onPressed,"initial":pressed},paramsPressure)
  );
  let [
    __selected,
    __setSelected,
    __indicator,
    __setIndicator,
    __stopIndicator
  ] = useActuation(Object.assign({
    "hold":__pressed,
    "active":selected,
    "onActive":onSelected,
    "initial":selected
  },paramsIndicator));
  React.useEffect(function (){
    if(onSelected){
      onSelected(null || __selected);
    }
  },[__selected]);
  React.useEffect(function (){
    if(selected != __selected){
      __setSelected(selected);
    }
  },[selected]);
  React.useEffect(function (){
    if(!__pressed && __selected){
      if(__stopIndicator.current){
        __stopIndicator.current();
      }
      if(__stopPressure.current){
        __stopPressure.current();
      }
      __setIndicator(Math.max(__indicator,__pressure));
      __setPressure(__pressure - 1);
    }
  },[__pressed,__selected]);
  React.useEffect(function (){
    if(__pressed && !__selected && (__indicator < 900)){
      if(__pressure > 990){
        __setIndicator(__pressure);
        __setPressure(0);
      }
    }
    if(__indicator > 990){
      __setIntensity(
        ((0.8 * Math.max(__indicator,__pressure)) + (0.2 * __pressure)) / 1000
      );
    }
    else{
      __setIntensity((0.8 * Math.max(__indicator,__pressure)) / 1000);
    }
  },[__indicator,__pressure]);
  return (
    <box>
      <button
        ref={ref}
        shrink={true}
        bg="blue"
        mouse={true}
        onMouse={function (e){
          if(e.button == "left"){
            if(e.action == "mouseup"){
              __setPressed(false);
            }
            else if(e.action == "mousedown"){
              __setPressed(true);
            }
          }
        }}
        onClick={function (e){
          __setSelected(!__selected);
        }}
        content={text + " "}>
      </button>
      <box bg="red" top={1} height={1} width={__intensity * 30}></box>
    </box>);
}

// play.tui-003-sensor.main/Menu [276] 
function Menu(props){
  let [index,setIndex] = React.useState(1);
  return (
    <box>
      <box top={0}>
        <MenuToggle
          onSelected={function (v){
            if(v){
              setIndex(0);
            }
            else{
              if(index == 0){
                setIndex(null);
              }
            }
          }}
          selected={index == 0}
          paramsPressure={{"speed":6}}
          text="CHOICE 0 ">
        </MenuToggle>
      </box>
      <box top={3}>
        <MenuToggle
          onSelected={function (v){
            if(v){
              setIndex(1);
            }
            else{
              if(index == 1){
                setIndex(null);
              }
            }
          }}
          selected={index == 1}
          paramsPressure={{"speed":6}}
          text="CHOICE 1 ">
        </MenuToggle>
      </box>
      <box top={6}>
        <MenuToggle
          onSelected={function (v){
            if(v){
              setIndex(2);
            }
            else{
              if(index == 2){
                setIndex(null);
              }
            }
          }}
          selected={index == 2}
          paramsPressure={{"speed":6}}
          text="CHOICE 2 ">
        </MenuToggle>
      </box>
    </box>);
}

// play.tui-003-sensor.main/App [308] 
function App(){
  let [pressed,setPressed] = React.useState();
  let [selected,setSelected] = React.useState();
  let [intensity,setIntensity] = React.useState(0);
  return (
    <box>
      <box top={5} left={10}><Menu></Menu></box>
      <box top={20} shrink={true} left={10}>
        <MenuToggle
          onSelected={setSelected}
          onPressed={setPressed}
          onIntensity={setIntensity}
          paramsPressure={{"speed":6}}
          text={(selected ? " ON " : " OFF ") + intensity.toFixed(3)}>
        </MenuToggle>
      </box>
    </box>);
}

// play.tui-003-sensor.main/__init__ [328] 
// ce5e1e48-dc5c-49a7-a381-0323943e08bc
b.run((
  <App></App>),"Tui 003 - Sensor");