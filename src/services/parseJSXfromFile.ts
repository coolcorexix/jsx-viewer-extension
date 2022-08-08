// @ts-nocheck
// this is a legacy from react json parser so better accept type error 
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse'
import * as babelTypesDetector from '@babel/types'

export interface JSXNode {
  props: {
    children: JSXNode[],
  },
  sourceLocation: Partial<{
    start: {
      column: number,
      line: number,
    },
    end: {
      column: number,
      line: number,
    }
  }>,
  type: string,
  parentType?: string,
}

const addChild = (parent, child) => {
  const parentNode = parent.__node
  if (!parentNode) {
    return;
  }
  if (!parentNode.props) {
    parentNode.props = {}
  }
  if (!parentNode.props.children) {
    parentNode.props.children = []
  }
  parentNode.props.children.push(child)
}

const getParentType = node => {
  if (babelTypesDetector.isJSXIdentifier(node)) {
    return node.name
  }
  if (babelTypesDetector.isJSXMemberExpression(node)) {
    return getParentType(node.object) + '.' + node.property.name
  }
}

export const parseJSXfromFile = (code, options: {
  only?: string,
  plainText?: boolean,
} = {}) => {
  const allowPlainText = !options.plainText
  const isAllowed =
    options && options.only && options.only.length
      ? name => (options.only && options.only.includes(name))
      : () => true

  const ast = babelParser.parse(code, { plugins: ["jsx", "typescript"], sourceType: 'module' })

  let trees: JSXNode[] = [];
  let level = 0

  traverse(ast, {
    JSXElement: {
      enter() {
        level++
      },
      exit() {
        level--
      },
    },
    JSXOpeningElement: {
      enter(path) {
        let jsxNode: JSXNode = {
          props: {
            children: [],
          },
          sourceLocation: {
            start: {
              line: 0,
              column: 0,
            },
            end: {
              line: 0,
              column: 0,
            }
          },
          type: '',
        };
        const { name } = path.node;

        jsxNode.sourceLocation = {
          start: {
            line: path.node.loc.start.line,
            column: path.node.loc.start.column,
          },
        }
        if (path.node.selfClosing) {
          jsxNode.sourceLocation.end = {
            line: path.node.loc.end.line,
            column: path.node.loc.end.column,
          }
        }

        if (babelTypesDetector.isJSXIdentifier(name)) {
          jsxNode.type = name.name;
        } else if (babelTypesDetector.isJSXMemberExpression(name)) {
          jsxNode = {
            ...jsxNode,
            type: name.property.name,
            parentType: getParentType(name.object),
          }
        }

        if (jsxNode && isAllowed(jsxNode.type)) {
          path.parent.__node = jsxNode
          if (level === 1) {
            trees.push(jsxNode)
          } else {
            addChild(path.parentPath.parentPath.node, jsxNode)
          }
        }
      },
    },
    JSXClosingElement(path) {
      const { node } = path
      const parent = path.findParent(p => babelTypesDetector.isJSXElement(p.node))
      const parentNode = parent.node.__node;
      console.log("🚀 ~ file: parseJSXfromFile.ts ~ line 119 ~ JSXClosingElement ~ parentNode", parentNode)
      console.log("🚀 ~ file: parseJSXfromFile.ts ~ line 123 ~ JSXClosingElement ~ path.node", path.node)
      parentNode.sourceLocation = {
        ...parentNode.sourceLocation,
        end: {
          line: path.node.loc.end.line,
          column: path.node.loc.end.column,
        }
      }
    },
    JSXAttribute(path) {
      const { node } = path
      const parent = path.findParent(p => babelTypesDetector.isJSXElement(p.node))
      const parentNode = parent.node.__node
      if (!parentNode.props) {
        parentNode.props = {}
      }
      parentNode.props[node.name.name] = node.value
        ? node.value.value
        : babelTypesDetector.booleanLiteral(true).value
    },
    JSXText(path) {
      const text = path.node.value.replace(/[\n]/g, '').trim()
      if (text && allowPlainText) {
        addChild(path.parent, text)
      }
    },
  })
  return trees
}