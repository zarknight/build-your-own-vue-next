const targetMap = new WeakMap();
let activeEffect = null
export function effect(eff) {
  activeEffect = eff
  activeEffect()
  activeEffect = null
}

export function track(target, key) {
  if(activeEffect){
    let depsMap = targetMap.get(target)
    if(!depsMap){
      targetMap.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(key)
    if(!dep) {
      depsMap.set(key, dep = new Set());
    }
    dep.add(activeEffect)
  }
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if(depsMap){
    let dep = depsMap.get(key)
    if(dep) {
      dep.forEach(effect => effect())
    }
  }
}

const reactiveHandler = {
  get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver)
    track(target, key)
    return result
  },
  set(target, key, value, receiver) {
    const oldVal = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if(oldVal !== result){
      trigger(target, key)
    }
    return result
  }
}

export function reactive(target) {
  return new Proxy(target, reactiveHandler)
}

export function ref(raw) {
  const r = {
    get value() {
      track(r, 'value')
      return raw
    },
    set value(newVal) {
      raw = newVal
      trigger(r, 'value')
    }
  }
  return r
}

export function computed(getter) {
  const result = ref(null);
  effect(() => result.value = getter())
  return result
}
