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
  DocsConfigInterface,
  DocsTypeAlias,
  DocsTypeAliasReference,
} from './types';
import { getTsProgram } from './transpile';
import GithubSlugger from 'github-slugger';
import { formatMethodSignature } from './formatting';

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
  const typeAliases: DocsTypeAlias[] = [];
  const pluginConfigs: DocsInterface[] = [];

  tsSourceFiles.forEach(tsSourceFile => {
    parseSourceFile(
      tsSourceFile,
      typeChecker,
      interfaces,
      typeAliases,
      enums,
      pluginConfigs,
    );
  });

  return (api: string) => {
    let apiInterface = interfaces.find(i => i.name === api) || null;

    /**
     * Add methods of import(many is used in `extends`)
     */
    const allImportObject = interfaces
      .filter(i => apiInterface?.importObject.includes(i.name) && i.name !== api)
      .map(i => i.importObject);

    const otherMethod = interfaces
      .filter(i => [...new Set(allImportObject.flat())].includes(i.name))
      .map(d => d.methods)|| null;

    if (apiInterface !== null && otherMethod && otherMethod.length > 0) {
      apiInterface.methods = [...new Set(apiInterface?.methods.concat(otherMethod.flat(1)))];
    }

    const data: DocsData = {
      api: apiInterface,
      interfaces: [],
      enums: [],
      typeAliases: [],
      pluginConfigs,
    };

    if (apiInterface) {
      collectInterfaces(data, apiInterface, interfaces, typeAliases, enums);
    }

    return data;
  };
}

function collectInterfaces(
  data: DocsData,
  i: DocsInterface,
  interfaces: DocsInterface[],
  typeAliases: DocsTypeAlias[],
  enums: DocsEnum[],
) {
  if (
    i.name !== data.api?.name &&
    !data.interfaces.some(di => di.name === i.name)
  ) {
    data.interfaces.push(i);
  }

  i.methods.forEach(m => {
    collectUsed(data, m.complexTypes, interfaces, typeAliases, enums);
  });
  i.properties.forEach(p => {
    collectUsed(data, p.complexTypes, interfaces, typeAliases, enums);
  });
}

function collectUsed(
  data: DocsData,
  complexTypes: string[],
  interfaces: DocsInterface[],
  typeAliases: DocsTypeAlias[],
  enums: DocsEnum[],
) {
  complexTypes.forEach(typeName => {
    const fi = interfaces.find(i => i.name === typeName);
    if (fi && !data.interfaces.some(i => i.name === fi.name)) {
      collectInterfaces(data, fi, interfaces, typeAliases, enums);
    }
    const ei = enums.find(en => en.name === typeName);
    if (ei && !data.enums.some(en => en.name === ei.name)) {
      data.enums.push(ei);
    }
    const ti = typeAliases.find(ty => ty.name === typeName);
    if (ti && !data.typeAliases.some(ty => ty.name === ti.name)) {
      data.typeAliases.push(ti);

      ti.types.forEach(type => {
        collectUsed(data, type.complexTypes, interfaces, typeAliases, enums);
      });
    }
  });
}

function parseSourceFile(
  tsSourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  interfaces: DocsInterface[],
  typeAliases: DocsTypeAlias[],
  enums: DocsEnum[],
  pluginConfigs: DocsInterface[],
) {
  const statements = tsSourceFile.statements;
  const interfaceDeclarations = statements.filter(ts.isInterfaceDeclaration);
  const typeAliasDeclarations = statements.filter(ts.isTypeAliasDeclaration);
  const enumDeclarations = statements.filter(ts.isEnumDeclaration);
  const moduleDeclarations = statements.filter(ts.isModuleDeclaration);

  interfaceDeclarations.forEach(interfaceDeclaration => {
    interfaces.push(getInterface(typeChecker, interfaceDeclaration));
  });

  enumDeclarations.forEach(enumDeclaration => {
    enums.push(getEnum(typeChecker, enumDeclaration));
  });

  typeAliasDeclarations.forEach(typeAliasDeclaration => {
    typeAliases.push(getTypeAlias(typeChecker, typeAliasDeclaration));
  });

  moduleDeclarations
    .filter(m => m?.name?.text === '@capacitor/cli')
    .forEach(moduleDeclaration => {
      getPluginsConfig(typeChecker, moduleDeclaration, pluginConfigs);
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

  // @ts-ignore
  const importObject = node.parent?.locals?.keys() || []

  const i: DocsInterface = {
    name: interfaceName,
    slug: slugify(interfaceName),
    docs: docs?.docs || '',
    tags: docs?.tags || [],
    methods,
    properties,
    importObject: [...importObject].filter((d: string) => d !== interfaceName)
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

function getTypeAlias(
  typeChecker: ts.TypeChecker,
  node: ts.TypeAliasDeclaration,
) {
  const symbol = typeChecker.getSymbolAtLocation(node.name);
  const docs = symbol ? serializeSymbol(typeChecker, symbol) : null;

  const typeAliasName = node.name.text;

  const typeAlias: DocsTypeAlias = {
    name: typeAliasName,
    slug: slugify(typeAliasName),
    docs: docs?.docs || '',
    types: [],
  };

  if (node.type) {
    if (ts.isFunctionTypeNode(node.type)) {
      const signature = typeChecker.getSignatureFromDeclaration(node.type);
      if (signature) {
        const referencedTypes = new Set(getAllTypeReferences(node.type));
        referencedTypes.delete('Promise');

        const signatureString = typeChecker.signatureToString(signature);
        typeAlias.types = [
          {
            text: signatureString,
            complexTypes: Array.from(referencedTypes),
          },
        ];
      }
    } else if (ts.isUnionTypeNode(node.type) && node.type.types) {
      typeAlias.types = node.type.types.map(t => {
        const referencedTypes = new Set(getAllTypeReferences(t));
        referencedTypes.delete('Promise');
        const typeRef: DocsTypeAliasReference = {
          text: t.getText(),
          complexTypes: Array.from(referencedTypes),
        };
        return typeRef;
      });
    } else if (typeof node.type.getText === 'function') {
      const referencedTypes = new Set(getAllTypeReferences(node.type));
      referencedTypes.delete('Promise');
      typeAlias.types = [
        {
          text: node.type.getText(),
          complexTypes: Array.from(referencedTypes),
        },
      ];
    }
  }

  return typeAlias;
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

  const tags = signature.getJsDocTags();
  if (tags.some(t => t.name === 'hidden')) {
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
    tags,
    docs: ts.displayPartsToString(
      signature.getDocumentationComment(typeChecker),
    ),
    complexTypes: Array.from(referencedTypes),
    slug: '',
  };

  m.slug = slugify(formatMethodSignature(m));

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
    type: typeToString(typeChecker, type, properytSignature.type),
  };
  return p;
}

function getPluginsConfig(
  typeChecker: ts.TypeChecker,
  moduleDeclaration: ts.ModuleDeclaration,
  pluginConfigs: DocsConfigInterface[],
) {
  const body = moduleDeclaration.body as ts.ModuleBlock;
  if (!Array.isArray(body.statements)) {
    return;
  }

  const pluginConfigInterfaces = body.statements.filter(
    (s: ts.InterfaceDeclaration) =>
      s?.name?.text === 'PluginsConfig' &&
      Array.isArray(s?.members) &&
      s.members.length > 0,
  ) as ts.InterfaceDeclaration[];

  pluginConfigInterfaces.forEach(pluginConfigInterface => {
    pluginConfigInterface.members
      .filter(ts.isPropertySignature)
      .filter(p => p?.type && (p?.type as ts.TypeLiteralNode).members)
      .forEach(properytSignature => {
        const typeLiteral = properytSignature.type as ts.TypeLiteralNode;

        const nm = properytSignature.name.getText();
        const symbol = typeChecker.getSymbolAtLocation(properytSignature.name);
        const docs = symbol ? serializeSymbol(typeChecker, symbol) : null;
        const i: DocsConfigInterface = {
          name: nm,
          slug: slugify(nm),
          properties: typeLiteral.members
            .filter(ts.isPropertySignature)
            .map(propertySignature => {
              return getInterfaceProperty(typeChecker, propertySignature);
            })
            .filter(p => p != null) as DocsInterfaceProperty[],
          docs: docs?.docs || '',
        };

        if (i.properties.length > 0) {
          pluginConfigs.push(i);
        }
      });
  });
}

function typeToString(
  checker: ts.TypeChecker,
  type: ts.Type,
  typeNode?: ts.TypeNode,
) {
  if (typeNode && ts.isTypeReferenceNode(typeNode)) {
    return typeNode.getText();
  }

  const TYPE_FORMAT_FLAGS =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.NoTypeReduction |
    ts.TypeFormatFlags.WriteArrowStyleSignature |
    ts.TypeFormatFlags.WriteTypeArgumentsOfSignature |
    ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

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

  return referencedTypes;
}

function getEntityName(entity: ts.EntityName): string {
  if (ts.isIdentifier(entity)) {
    return entity.escapedText.toString();
  } else {
    return getEntityName(entity.left);
  }
}

export function slugify(id: string) {
  const s = new GithubSlugger();
  return s.slug(id);
}
