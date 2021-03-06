import {isNumber, isBoolean, isObject, isArray, isString} from 'sav-util'

/**
 * 字符串解析
 * bool类型 加引号
 * number类型 加引号, 科学计数转换为值
 */
export function stringVal (val) {
  if (isNumber(val) || isBoolean(val)) {
    return String(val)
  }
  return val
}

/**
 * 布尔解析
 * 字符串类型 只处理true/false/on/off 不区分大小写
 * number类型 0 => false, 其他均为 true
 */
export function boolVal (val) {
  if (isNumber(val)) {
    return Boolean(val)
  }
  if (isString(val)) {
    if (val.length < 6) {
      switch (val.toLowerCase()) {
        case 'true':
        case 'on':
          return true
        case 'false':
        case 'off':
          return false
      }
    }
  }
  return val
}

/**
 * 数字解析
 * 布尔类型
 * 字符串类型 只处理true/false/on/off 不区分大小写
 * 数字类型字符串 "1.23456792E8" => (double)123456792, 科学计数转换为值
 */
export function numberVal (val) {
  if (isBoolean(val)) {
    return Number(val)
  } else if (isString(val)) {
    let it = parseFloat(val)
    if (!isNaN(it)) {
      return it
    }
    if (val.length < 6) {
      switch (val.toLowerCase()) {
        case 'true':
        case 'on':
          return 1
        case 'false':
        case 'off':
          return 0
      }
    }
  }
  return val
}

/**
 * 数组解析
 * JSON字符串
 */
export function arrayVal (val) {
  if (isString(val)) {
    if (val[0] === '[' && val[val.length - 1] === ']') {
      try {
        return JSON.parse(val)
      } catch (err) {
        return val
      }
    }
  }
  return val
}

/**
 * 对象解析
 * JSON字符串
 */
export function objectVal (val) {
  if (isString(val)) {
    if (val[0] === '{' && val[val.length - 1] === '}') {
      try {
        return JSON.parse(val)
      } catch (err) {
        return val
      }
    }
  }
  return val
}

let rangs = {
  // 0xFF byte 的取值范围为-128~127，占用1个字节 -2的7次方到2的7次方-1
  Int8: [-128, 127],
  UInt8: [0, 255],
  Byte: [-128, 255],
  // 0xFFFF short 的取值范围为-32768~32767，占用2个字节 -2的15次方到2的15次方-1
  Int16: [-32768, 32767],
  UInt16: [0, 65535],
  Short: [-32768, 65535],
  // 0xFFFFFFFF int的取值范围为-2147483648~2147483647，占用4个字节 -2的31次方到2的31次方-1
  Int32: [-2147483648, 2147483647],
  UInt32: [0, 4294967295],
  Integer: [-2147483648, 4294967295],
  // -0X1FFFFFFFFFFFFF ~ 0X1FFFFFFFFFFFFF, Number.MAX_SAFE_INTEGER ~ Number.MAX_SAFE_INTEGER
  // 占用8个字节 -2的53次方到2的53次方-1 Math.pow(2, 53)
  Long: [-9007199254740991, 9007199254740991]
}

export function isNatural (val) {
  return isNumber(val) && parseInt(val) === val
}

export function isStringObject (val) {
  if (isString(val)) {
    return true
  }
  return (typeof val === 'object') && (val !== null) && (val.constructor.name === 'ObjectID')
}

let types = [
  {name: String, check: isStringObject, parse: stringVal},
  {name: Number, check: isNumber, parse: numberVal},
  {name: Boolean, check: isBoolean, parse: boolVal},
  {name: Array, check: isArray, parse: arrayVal},
  {name: Object, check: isObject, parse: objectVal}
].map(it => {
  it.default = it.name
  it.name = it.name.name
  return it
})

Object.keys(rangs).forEach(name => {
  let [min, max] = rangs[name]
  types.push({
    name,
    default: Number,
    check: (val) => {
      return isNatural(val) && val >= min && val <= max
    },
    parse: numberVal,
    min,
    max
  })
})

export function registerTypes (schema) {
  types.forEach(it => schema.registerType(it))
}
