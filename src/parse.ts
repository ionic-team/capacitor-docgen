import ts from 'typescript';
import type {
  DocsData,
  DocsParseOptions,
  DocsEnumMember,
  DocsEnum,
  DocsInterface,
  DocsInterfaceMethod,
  DocsMethodParam,
  DocsJsDoc,
  DocsInterfaceProperty,
} from './types';
import { getTsProgram } from './transpile';
import GithubSlugger from 'github-slugger';

/**
 * Given either a tsconfig file path, or exact input files, will
 * use TypeScript to parse apart the source file's JSDoc comments
 * and returns a function which can be used to get a specific
 * interface as the primary api. Used by the generate() function.
 */
export function parse(opts: DocsParseOptions) {
  const tsProgram = getTsProgram(opts);
  const typeChecker = tsProgram.getTypeChecker();
  const tsSourceFiles = tsProgram.getSourceFiles();

  const interfaces: DocsInterface[] = [];
  const enums: DocsEnum[] = [];

  tsSourceFiles.forEach(tsSourceFile => {
    parseSourceFile(tsSourceFile, typeChecker, interfaces, enums);
  });

  return (api: string) => {
    const apiInterface = interfaces.find(i => i.name === api) || null;

    const data: DocsData = {
      api: apiInterface,
      interfaces: [],
      enums: [],
    };

    if (apiInterface) {
      collectInterfaces(data, apiInterface, interfaces, enums);
    }

    return data;
  };
}

function collectInterfaces(
  data: DocsData,
  i: DocsInterface,
  interfaces: DocsInterface[],
  enums: DocsEnum[],
) {
  if (
    i.name !== data.api?.name &&
    !data.interfaces.some(di => di.name === i.name)
  ) {
    data.interfaces.push(i);
  }

  i.methods.forEach(m => {
    collectUsed(data, m.complexTypes, interfaces, enums);
  });
  i.properties.forEach(p => {
    collectUsed(data, p.complexTypes, interfaces, enums);
  });
}

function collectUsed(
  data: DocsData,
  complexTypes: string[],
  interfaces: DocsInterface[],
  enums: DocsEnum[],
) {
  complexTypes.forEach(typeName => {
    const fi = interfaces.find(i => i.name === typeName);
    if (fi && !data.interfaces.some(i => i.name === fi.name)) {
      collectInterfaces(data, fi, interfaces, enums);
    }
    const ei = enums.find(i => i.name === typeName);
    if (ei) {
      if (!data.enums.some(en => en.name === ei.name)) {
        data.enums.push(ei);
      }
    }
  });
}

function parseSourceFile(
  tsSourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  interfaces: DocsInterface[],
  enums: DocsEnum[],
) {
  const statements = tsSourceFile.statements;
  const interfaceDeclarations = statements.filter(ts.isInterfaceDeclaration);
  const enumDeclarations = statements.filter(ts.isEnumDeclaration);

  interfaceDeclarations.forEach(interfaceDeclaration => {
    interfaces.push(getInterface(typeChecker, interfaceDeclaration));
  });

  enumDeclarations.forEach(enumDeclaration => {
    enums.push(getEnum(typeChecker, enumDeclaration));
  });
}

function getInterface(
  typeChecker: ts.TypeChecker,
  node: ts.InterfaceDeclaration,
) {
  const interfaceName = node.name.text;
  const methods = node.members
    .filter(ts.isMethodSignature)
    .reduce((methods, methodSignature) => {
      const m = getInterfaceMethod(typeChecker, methodSignature);
      if (m) {
        methods.push(m);
      }
      return methods;
    }, [] as DocsInterfaceMethod[]);

  const properties = node.members
    .filter(ts.isPropertySignature)
    .reduce((properties, properytSignature) => {
      const p = getInterfaceProperty(typeChecker, properytSignature);
      if (p) {
        properties.push(p);
      }
      return properties;
    }, [] as DocsInterfaceProperty[]);

  const symbol = typeChecker.getSymbolAtLocation(node.name);
  const docs = symbol ? serializeSymbol(typeChecker, symbol) : null;

  const i: DocsInterface = {
    name: interfaceName,
    slug: slugify(interfaceName),
    docs: docs?.docs || '',
    tags: docs?.tags || [],
    methods,
    properties,
  };

  return i;
}

function getEnum(typeChecker: ts.TypeChecker, node: ts.EnumDeclaration) {
  const enumName = node.name.text;
  const en: DocsEnum = {
    name: enumName,
    slug: slugify(enumName),
    members: node.members.map(enumMember => {
      const symbol = typeChecker.getSymbolAtLocation(enumMember.name);
      const docs = symbol ? serializeSymbol(typeChecker, symbol) : null;

      const em: DocsEnumMember = {
        name: enumMember.name.getText(),
        value: enumMember.initializer?.getText(),
        tags: docs?.tags || [],
        docs: docs?.docs || '',
      };

      return em;
    }),
  };

  return en;
}

function getInterfaceMethod(
  typeChecker: ts.TypeChecker,
  methodSignature: ts.MethodSignature,
) {
  const flags =
    ts.TypeFormatFlags.WriteArrowStyleSignature |
    ts.TypeFormatFlags.NoTruncation;
  const signature = typeChecker.getSignatureFromDeclaration(methodSignature);
  if (!signature) {
    return null;
  }
  const returnType = typeChecker.getReturnTypeOfSignature(signature);
  const returnTypeNode = typeChecker.typeToTypeNode(
    returnType,
    methodSignature,
    ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.NoTypeReduction,
  );
  const returnString = typeToString(typeChecker, returnType);
  const signatureString = typeChecker.signatureToString(
    signature,
    methodSignature,
    flags,
    ts.SignatureKind.Call,
  );

  const referencedTypes = new Set([
    ...getAllTypeReferences(returnTypeNode),
    ...getAllTypeReferences(methodSignature),
  ]);
  referencedTypes.delete('Promise');

  const methodName = methodSignature.name.getText();

  const m: DocsInterfaceMethod = {
    name: methodName,
    signature: signatureString,
    parameters: signature.parameters.map(symbol => {
      const doc = serializeSymbol(typeChecker, symbol);
      const type = typeChecker.getTypeAtLocation(symbol.valueDeclaration);
      const param: DocsMethodParam = {
        name: symbol.name,
        docs: doc.docs,
        type: typeToString(typeChecker, type),
      };
      return param;
    }),
    returns: returnString,
    tags: signature.getJsDocTags(),
    docs: ts.displayPartsToString(
      signature.getDocumentationComment(typeChecker),
    ),
    complexTypes: Array.from(referencedTypes),
    slug: slugify(methodName),
  };

  return m;
}

function getInterfaceProperty(
  typeChecker: ts.TypeChecker,
  properytSignature: ts.PropertySignature,
) {
  const symbol = typeChecker.getSymbolAtLocation(properytSignature.name);
  if (!symbol) {
    return null;
  }

  const type = typeChecker.getTypeAtLocation(properytSignature);
  const docs = serializeSymbol(typeChecker, symbol);

  const referencedTypes = new Set(getAllTypeReferences(properytSignature));
  referencedTypes.delete('Promise');

  const propName = properytSignature.name.getText();
  const p: DocsInterfaceProperty = {
    name: propName,
    tags: docs.tags,
    docs: docs.docs,
    complexTypes: Array.from(referencedTypes),
    type: typeToString(typeChecker, type),
  };
  return p;
}

function typeToString(checker: ts.TypeChecker, type: ts.Type) {
  const TYPE_FORMAT_FLAGS =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.InTypeAlias |
    ts.TypeFormatFlags.InElementType;

  return checker.typeToString(type, undefined, TYPE_FORMAT_FLAGS);
}

function serializeSymbol(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): DocsJsDoc {
  if (!checker || !symbol) {
    return {
      tags: [],
      docs: '',
    };
  }
  return {
    tags: symbol
      .getJsDocTags()
      .map(tag => ({ text: tag.text, name: tag.name })),
    docs: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
  };
}

function getAllTypeReferences(node: ts.Node | undefined) {
  const referencedTypes: string[] = [];

  const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
    if (ts.isTypeReferenceNode(node)) {
      referencedTypes.push(getEntityName(node.typeName));
      if (node.typeArguments) {
        node.typeArguments.filter(ts.isTypeReferenceNode).forEach(tr => {
          const typeName = tr.typeName as ts.Identifier;
          if (typeName && typeName.escapedText) {
            referencedTypes.push(typeName.escapedText.toString());
          }
        });
      }
    }
    return ts.forEachChild(node, visit);
  };

  if (node) {
    visit(node);
  }

  return Array.from(referencedTypes);
}

function getEntityName(entity: ts.EntityName): string {
  if (ts.isIdentifier(entity)) {
    return entity.escapedText.toString();
  } else {
    return getEntityName(entity.left);
  }
}

function slugify(id: string) {
  const s = new GithubSlugger();
  return s.slug(id);
}
