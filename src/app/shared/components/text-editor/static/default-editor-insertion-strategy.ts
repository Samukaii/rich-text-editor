import { InsertInNewLineStrategy } from "../services/default-format-strategies/insert-in-new-line-strategy.service";

import { SurroundSelectionStrategy } from "../services/default-format-strategies/surround-selection-strategy.service";

export const defaultEditorInsertionStrategy = {
	'surround-selection': SurroundSelectionStrategy,
	'insert-in-new-line': InsertInNewLineStrategy
}
