"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  languages,
  CompletionItemProvider,
  CompletionItem,
  workspace,
  CompletionItemKind,
  SnippetString,
  MarkdownString
} from "vscode";
import * as fp from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const provider: CompletionItemProvider = {
    provideCompletionItems: (doc, _pos) => {
      if (doc.languageId !== "haskell") {
        return [];
      }
      const fullPath = workspace.rootPath
        ? fp.relative(workspace.rootPath, doc.fileName)
        : doc.fileName;
      const thePath = fp.parse(fullPath);
      let moduleName;
      if (/^[A-Z]/.test(thePath.name)) {
        const segs = [thePath.name];
        for (const dir of thePath.dir.split(fp.sep).reverse()) {
          if (!/^[A-Z]/.test(dir)) {
            break;
          }
          segs.unshift(dir);
        }
        moduleName = segs.join(".");
      } else {
        moduleName = "Main";
      }
      const mod: CompletionItem = new CompletionItem(
        "mod",
        CompletionItemKind.Snippet
      );
      mod.documentation = new MarkdownString("`module Main where...`");
      mod.filterText = "module";
      mod.insertText = new SnippetString(
        `module \${1:${moduleName}} where\n$0`
      );
      return [mod];
    }
  };
  const disp = languages.registerCompletionItemProvider(
    { scheme: "file", language: "" },
    provider
  );

  context.subscriptions.push(disp);
}

// this method is called when your extension is deactivated
export function deactivate() {}
