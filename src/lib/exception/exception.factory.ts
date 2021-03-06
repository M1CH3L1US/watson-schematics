import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';

import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { ExceptionOptions } from './exception.schema';

export function main(options: ExceptionOptions): Rule {
  options = transform(options);
  return chain([mergeSourceRoot(options), mergeWith(generate(options))]);
}

function transform(options: ExceptionOptions): ExceptionOptions {
  const target = { ...options };
  if (!target.name) {
    throw new SchematicsException("Option (name) is required.");
  }
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = strings.dasherize(location.path);

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: ExceptionOptions): Source {
  return (context: SchematicContext) =>
    apply(url("./files"), [
      options.spec ? noop() : filter((path) => !path.endsWith(".spec.ts")),
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
