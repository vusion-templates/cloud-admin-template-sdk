import { generate } from ".";

/**
 * /dd/dd/{id}
 * 
 * args 是 resolver 函数的参数
 * 
 * ‘/dd/dd/’ + args.id
 */
function Literal(str: string) {
  let temp = [];
  const arr: any = [];
  for(let i=0;i<str.length;i++){ 
    if(str[i]==='{'){ 
      const cloneTemp = [...temp]; 
      arr.push({ type: 'Literal', value: cloneTemp.join('') }); 
      temp = [];
    } else if(str[i]==='}') {
      const cloneTemp = [...temp]; 
      arr.push({ 
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'args'   
        },
        property: {
          type: 'Identifier', name: cloneTemp.join('')
        }
       }); 
      temp = []; 
    } else { 
      temp.push(str[i]); 
      if (i == str.length - 1) {
        const cloneTemp = [...temp]; 
        arr.push({ type: 'Literal', value: cloneTemp.join('') }); 
      }
    }
  }
  return arr;
}

export function TransforArrToBinaryExpression(arr: string[]) {
  let root: any = {};
  if (arr.length >= 2) {
    while(arr.length) {
      if(root.type) {
        root.right = root;
        root.left = arr.pop();
        root.operator = '+';
        root.type = 'BinaryExpression';
      } else {
        const right = arr.pop();
        const left = arr.pop();
        root = {
          operator: '+',
          left,
          right,
          type: 'BinaryExpression',
        };
      }
    }
  } else {
    // if only one
    root = arr[0];
  }

  return root;
}


/**
 * asdfaf{d}
 * =>  'asdfaf' + args.d
 * 
 * 因为路径解析参数在 args 里面设置
 */
export function PathToBinaryExpressionString(str: string) {
  if (str.length >= 1) {
    const arr: string[] = Literal(str);
    return generate(TransforArrToBinaryExpression(arr));
  }
  return str;
}


interface Param {
  name: string;
}

export function QueryToObjectExpression(obj: Param[] = []) {
  const root: {
    type: string;
    properties: any[];
  } = {
    type: 'ObjectExpression',
    properties: [],
  }

  obj.forEach((param: Param) => {
    const { name } = param;
    // check if in query
    root.properties.push(
      {
        type: 'Property',
        key: {
          type: 'Identifier',
          name,
        },
        value: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'args',
          },
          property: {
            type: 'Identifier',
            name
          }
        }
      }
    )
  })


  return generate(root);
}