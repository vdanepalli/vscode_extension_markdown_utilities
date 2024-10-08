import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// Load predefined colors from global state
	const predefinedColorsKey = 'predefinedColors';
	let predefinedColors: { label: string; description: string }[] = context.globalState.get(predefinedColorsKey, [
		{ label: 'Red', description: '#ff0000' },
		{ label: 'Blue', description: '#0000ff' },
		{ label: 'Green', description: '#00ff00' },
		{ label: 'Yellow', description: '#ffff00' }
	]);

	let disposable = vscode.commands.registerCommand('extension.highlightText', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		// Check if the selected text is already highlighted
		const spanRegex = /<span style="color: #[a-fA-F0-9]{6};">(.+?)<\/span>/;
		if (spanRegex.test(selectedText)) {
			const unwrappedText = selectedText.replace(spanRegex, '$1');
			editor.edit(editBuilder => {
				editBuilder.replace(selection, unwrappedText);
			});
			return;
		}

		// Show quick pick for predefined colors
		const selectedColorLabel = await vscode.window.showQuickPick(
			[...predefinedColors.map(color => color.label), 'Custom Color...'],
			{ placeHolder: 'Select a color or enter your own' }
		);

		let color: string | undefined;

		if (selectedColorLabel === 'Custom Color...') {
			// If "Custom Color..." is selected, show the input box
			color = await vscode.window.showInputBox({
				placeHolder: 'Enter a hex color code (e.g., #ff0000)',
				prompt: 'Enter the hex color code',
				value: '#'
			});
		} else {
			// Otherwise, use the selected predefined color
			color = predefinedColors.find(c => c.label === selectedColorLabel)?.description;
		}

		if (color) {
			const highlightedText = `<span style="color: ${color};">${selectedText}</span>`;
			editor.edit(editBuilder => {
				editBuilder.replace(selection, highlightedText);
			});
		}
	});

	// Command to highlight/unhighlight text with a background color
	let highlightWithBackgroundDisposable = vscode.commands.registerCommand('extension.highlightBackground', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		// Check if the selected text is already highlighted with background color
		const spanBackgroundRegex = /<span style="background-color: #[a-fA-F0-9]{6};">(.+?)<\/span>/;
		if (spanBackgroundRegex.test(selectedText)) {
			const unwrappedText = selectedText.replace(spanBackgroundRegex, '$1');
			editor.edit(editBuilder => {
				editBuilder.replace(selection, unwrappedText);
			});
			return;
		}

		// Show quick pick for predefined colors
		const selectedColorLabel = await vscode.window.showQuickPick(
			[...predefinedColors.map(color => color.label), 'Custom Color...'],
			{ placeHolder: 'Select a background color or enter your own' }
		);

		let color: string | undefined;

		if (selectedColorLabel === 'Custom Color...') {
			// If "Custom Color..." is selected, show the input box
			color = await vscode.window.showInputBox({
				placeHolder: 'Enter a hex color code (e.g., #ff0000)',
				prompt: 'Enter the hex color code',
				value: '#'
			});
		} else {
			// Otherwise, use the selected predefined color
			color = predefinedColors.find(c => c.label === selectedColorLabel)?.description;
		}

		if (color) {
			const highlightedText = `<span style="background-color: ${color}; color: black;">${selectedText}</span>`;
			editor.edit(editBuilder => {
				editBuilder.replace(selection, highlightedText);
			});
		}
	});

	// Command to manage colors
	let manageColorsDisposable = vscode.commands.registerCommand('extension.manageColors', async () => {
		const action = await vscode.window.showQuickPick(['Add New Color', 'Edit Existing Color', 'Delete Color'], {
			placeHolder: 'What would you like to do?'
		});

		if (action === 'Add New Color') {
			const label = await vscode.window.showInputBox({ placeHolder: 'Color name' });
			const description = await vscode.window.showInputBox({ placeHolder: 'Hex color code (e.g., #ff0000)' });

			if (label && description) {
				predefinedColors.push({ label, description });
				context.globalState.update(predefinedColorsKey, predefinedColors);
				vscode.window.showInformationMessage(`Added color ${label}`);
			}
		} else if (action === 'Edit Existing Color') {
			const colorToEdit = await vscode.window.showQuickPick(predefinedColors.map(color => color.label), {
				placeHolder: 'Select a color to edit'
			});
			const newDescription = await vscode.window.showInputBox({
				placeHolder: 'New hex color code (e.g., #ff0000)',
				value: predefinedColors.find(c => c.label === colorToEdit)?.description
			});

			if (colorToEdit && newDescription) {
				const color = predefinedColors.find(c => c.label === colorToEdit);
				if (color) {
					color.description = newDescription;
					context.globalState.update(predefinedColorsKey, predefinedColors);
					vscode.window.showInformationMessage(`Updated color ${colorToEdit}`);
				}
			}
		} else if (action === 'Delete Color') {
			const colorToDelete = await vscode.window.showQuickPick(predefinedColors.map(color => color.label), {
				placeHolder: 'Select a color to delete'
			});

			if (colorToDelete) {
				predefinedColors = predefinedColors.filter(c => c.label !== colorToDelete);
				context.globalState.update(predefinedColorsKey, predefinedColors);
				vscode.window.showInformationMessage(`Deleted color ${colorToDelete}`);
			}
		}
	});

	let underlineTextDisposable = vscode.commands.registerCommand('extension.underlineText', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		// Check if the selected text is already underlined
		const underlineRegex = /<u>(.+?)<\/u>/;
		if (underlineRegex.test(selectedText)) {
			const unwrappedText = selectedText.replace(underlineRegex, '$1');
			editor.edit(editBuilder => {
				editBuilder.replace(selection, unwrappedText);
			});
			return;
		}

		// If not underlined, wrap the text in <u> tags
		const underlinedText = `<u>${selectedText}</u>`;
		
		editor.edit(editBuilder => {
			editBuilder.replace(selection, underlinedText);
		});
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(highlightWithBackgroundDisposable);
	context.subscriptions.push(manageColorsDisposable);
	context.subscriptions.push(underlineTextDisposable);
}

export function deactivate() {}