# @capacitor/docgen

Docs Readme Markdown and JSON Generator for [Capacitor](https://capacitorjs.com/) Plugins.

- Designed specifically for generating docs for Capacitor plugins using TypeScript
- Gerenates docs data pulled from [JSDocs](https://en.wikipedia.org/wiki/JSDoc) within source code 
- Replaces placeholders within existing README.md markdown files with the generated docs
- Outputs a json file of the raw docs data
- Ideal for formatted docs within Github and NPM readme landing pages
- If you're looking for an entire docs site generator we recommend [TypeDoc](https://typedoc.org/) instead


## Example Readme File

```
# My Capacitor Plugin 🔌

The readme file can be formatted however you'd like. Just insert 
the  HTML placeholder comments where the Index of the API
methods, and the API docs should go.

Below is an index of all the methods available.

<!--DOCGEN_INDEX_START-->
<!--DOCGEN_INDEX_END-->

## Custom Content

Manage your readme content however you'd like, and on every docgen 
rebuild it will leave your original content as is, but update the 
HTML placeholder comments with the updated generated docs.

<!--DOCGEN_API_START-->
<!--DOCGEN_API_END-->

## Commit Your Readme 🚀

The benefit is that this readme file also acts as the landing page 
for Github and NPM, and the anchors within the docs can also be 
linked to and shared.
```


## CLI

Easiest way to run `docgen` is to install `@capacitor/docgen` as a dev dependency
and add the command to the `package.json` scripts. In the example below, 
`HapticsPlugin` is the primary interface:

```bash
docgen --api HapticsPlugin --output-readme README.md
```

| Flag              | Alias | Description                                                                              |
|-------------------|-------|------------------------------------------------------------------------------------------|
| `--api`           | `-a`  | The name of the primary application programming interface. **Required**                  |
| `--output-readme` | `-r`  | Path to the markdown file to update. Note that the file must already exist. **Required** |
| `--output-json`   | `-j`  | Path to write the raw docs data as a json file.                                          |
| `--project`       | `-p`  | Path to the project's `tsconfig.json` file, same as the [project](https://www.typescriptlang.org/docs/handbook/compiler-options.html) flag for TypeScript's CLI. By default it'll attempt to find this file. |


## Related

- [Capacitor](https://capacitorjs.com/)
- [Capacitor Community Plugins](https://github.com/capacitor-community)
