import {
  CommandBlock,
  ComparisonOperator,
  LogicalOperator,
  Operation,
  Options,
  Result,
  TypeOperator,
} from "../types";

export default class TemplatingEngine {
  private template: string;
  private options: Options;

  public constructor(template: string, options: Options) {
    this.template = template;
    this.options = options;
  }

  private parseTemplate(template: string): CommandBlock[] {
    const regex = /\[(SINO PERO|SINO|SI|DEFAULT)([^\]]*)\](.*?)\[FIN\]/gs;
    const result: CommandBlock[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      const type = match[1] as TypeOperator;
      const command = `${match[1]}${match[2]}`.trim();
      let template = match[3].trim();

      result.push({
        type,
        template,
        command,
      });
    }

    return result;
  }

  private parseCommand(command: string): Operation[] {
    const strippedInput = command.replace(/^(SI|SINO PERO) /, "");
    const sections = strippedInput.split(/ (?=Y {{|O {{)/);

    return sections.map((section) => {
      let logicalOperator: LogicalOperator | undefined = undefined;

      if (section.startsWith("Y ") || section.startsWith("O ")) {
        logicalOperator = section.startsWith("Y ") ? "Y" : "O";
        section = section.slice(2);
      }

      const text = section.trim();

      const parts = this.parseToParts(text);

      return {
        leftSideValue: parts[0],
        comparisonOperator: parts[1] as ComparisonOperator,
        rightSideValue: parts[2],
        logicalOperator,
      };
    });
  }

  private parseToParts(text: string): string[] {
    const regex = /({{.*?}})|(ES IGUAL QUE|NO ES IGUAL QUE)/g;

    let match;
    let matches = [];

    while ((match = regex.exec(text)) !== null) {
      for (let i = 1; i < match.length; i++) {
        if (match[i] !== undefined) {
          matches.push(match[i].trim());
        }
      }
    }

    return matches;
  }

  private processPlaceholder(placeholder: string): any {
    const stripped = placeholder.slice(2, -2).trim();

    if (stripped.startsWith("'") && stripped.endsWith("'")) {
      return stripped.slice(1, -1);
    } else if (!isNaN(Number(stripped))) {
      return Number(stripped);
    }

    const parts = stripped.split(".");

    let object: any;

    switch (parts[0]) {
      case "usuario":
        object = this.options.usuario;
        break;
      case "cliente":
        object = this.options.cliente;
        break;
      case "elemento":
        object = this.options.elemento;
        break;
      case "ticket":
        object = this.options.ticket;
        break;
      case "problema":
        object = this.options.problema;
        break;
      case "servicio":
        object = this.options.servicio;
        break;
      case "operación":
        object = this.options.operación;
        break;
      case "previamente":
        object = this.options.previamente;
        break;
      default:
        throw new Error(`Invalid object name ${parts[0]}`);
    }

    if (!object) throw new Error(`Object ${parts[0]} is undefined`);

    for (let i = 1; i < parts.length; i++) {
      object = object[parts[i]];
      if (object === undefined)
        throw new Error(`Property ${parts[i]} is undefined`);
    }

    return object;
  }

  private processOperation(operation: Operation): Result {
    const processed = {
      leftSideValue: this.processPlaceholder(operation.leftSideValue as string),
      rightSideValue: this.processPlaceholder(
        operation.rightSideValue as string
      ),
    };

    switch (operation.comparisonOperator) {
      case "ES IGUAL QUE":
        return {
          isTrue: processed.leftSideValue === processed.rightSideValue,
          logicalOperator: operation.logicalOperator,
        };
      case "NO ES IGUAL QUE":
        return {
          isTrue: processed.leftSideValue !== processed.rightSideValue,
          logicalOperator: operation.logicalOperator,
        };
      default:
        return {
          isTrue: false,
        };
    }
  }

  private processOperations(operations: Operation[]): Result[] {
    return operations.map((operation) => {
      return this.processOperation(operation);
    });
  }

  private processResults(results: Result[]): boolean {
    if (results.length === 0) {
      throw new Error("No results provided");
    } else if (results.length === 1) {
      return results[0].isTrue;
    }

    let result = results[0].isTrue;

    for (let i = 1; i < results.length; i++) {
      const currentResult = results[i];

      if (currentResult.logicalOperator === "Y") {
        result = result && currentResult.isTrue;
      } else if (currentResult.logicalOperator === "O") {
        result = result || currentResult.isTrue;
      }
    }

    return result;
  }

  private processTemplate(template: string) {
    const regex = /\{\{([^\}]+)\}\}/g;
    return template.replace(regex, (_match, captured) => {
      return this.processPlaceholder(`{{${captured.trim()}}}`);
    });
  }

  start(): string {
    const commandBlock = this.parseTemplate(this.template).map(
      (commandBlock) => {
        if (commandBlock.type === "SI" || commandBlock.type === "SINO PERO") {
          return {
            ...commandBlock,
            operations: this.parseCommand(commandBlock.command),
          };
        } else return commandBlock;
      }
    );

    const DEFAULT = commandBlock.find(
      (commandBlock) => commandBlock.type === "DEFAULT"
    );

    if (DEFAULT) return this.processTemplate(DEFAULT.template);

    const SI = commandBlock.find((commandBlock) => commandBlock.type === "SI");

    if (SI) {
      const results = this.processOperations(SI.operations!);
      const valid = this.processResults(results);
      if (valid) return this.processTemplate(SI.template);
    }

    const SINO_PERO = commandBlock.filter(
      (commandBlock) => commandBlock.type === "SINO PERO"
    );

    if (SINO_PERO.length > 0) {
      let template: string | undefined;
      for (let commandBlock of SINO_PERO) {
        const results = this.processOperations(commandBlock.operations!);
        const valid = this.processResults(results);
        if (valid) {
          template = commandBlock.template;
          break;
        }
      }
      if (template) return this.processTemplate(template);
    }

    const SINO = commandBlock.find(
      (commandBlock) => commandBlock.type === "SINO"
    );

    if (SINO) {
      return this.processTemplate(SINO.template);
    }

    return "There seems to be an processing error. This text should not have been returned";
  }
}
