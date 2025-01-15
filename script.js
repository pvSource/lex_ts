document.getElementById('analyzeButton').addEventListener('click', () => {
    const codeInput = document.getElementById('codeInput').value;
    const tokensTable = document.getElementById('tokensTable').querySelector('tbody');
    const errorsList = document.getElementById('errorsList');
 
    tokensTable.innerHTML = '';
    errorsList.innerHTML = '';
 
    // Регулярные выражения для классов токенов TypeScript
    const tokenPatterns = [
        { regex: /^(?:abstract|any|as|boolean|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|module|namespace|never|new|null|number|object|package|private|protected|public|readonly|require|return|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield)\b/, type: 'Keyword' },
        { regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*/, type: 'Identifier' },
        { regex: /^\d+(\.\d+)?/, type: 'Number' },
        { regex: /^"([^"\[]|\\.)*"?/, type: 'String' },
        { regex: /^'([^'\[]|\\.)*'?/, type: 'String' },
        { regex: /^`([^`\[]|\\.)*`?/, type: 'Template String' },
        { regex: /^\/\/.*/, type: 'Single-line Comment' },
        { regex: /^\/\*[\s\S]*?\*\//, type: 'Multi-line Comment' },
        { regex: /^[{}();,.]/, type: 'Symbol' },
        { regex: /^[+\-*/%=&|^!<>?:~]/, type: 'Operator' },
        { regex: /^\/(?!\/)(\\\/|[^\/])+\/[gimsuy]*/, type: 'Regular Expression' },
        { regex: /^\s+/, type: 'Whitespace' } // Пробельные символы
    ];
    
    const lines = codeInput.split('\n');
    const errors = [];
    const quoteStack = []; // Стек для проверки кавычек
 
    lines.forEach((line, rowIndex) => {
        let columnIndex = 0;
 
        while (line.length > 0) {
            let matched = false;
 
            for (const pattern of tokenPatterns) {
                const match = line.match(pattern.regex);
                if (match) {
                    const token = match[0];
                    tokensTable.innerHTML += `
                        <tr>
                            <td>${token === ' ' ? '[space]' : token}</td>
                            <td>${pattern.type}</td>
                            <td>${rowIndex + 1}</td>
                            <td>${columnIndex + 1}</td>
                        </tr>
                    `;
                    columnIndex += token.length;

                    // Проверка открытых и закрытых кавычек
                    if (['"', "'", '`'].includes(token[0])) {
                        if (
                            token[token.length - 1] === token[0] &&
                            token.length > 1 &&
                            !token.endsWith('\\') // Убедимся, что строка корректно закрыта
                        ) {
                            // Если кавычка открывается и закрывается в одном токене, ничего не добавляем в стек
                        } else if (quoteStack.length > 0 && quoteStack[quoteStack.length - 1].quote === token[0]) {
                            quoteStack.pop(); // Закрывающая кавычка
                        } else {
                            quoteStack.push({ quote: token[0], row: rowIndex + 1, col: columnIndex });
                        }
                    }
 
                    line = line.slice(token.length);
                    matched = true;
                    break;
                }
            }
 
            if (!matched) {
                const invalidChar = line[0];
                errors.push(`Неизвестный символ "${invalidChar}" в строке ${rowIndex + 1}, столбце ${columnIndex + 1}`);
                line = line.slice(1);
                columnIndex++;
            }
        }
    });
 
    // Проверка незакрытых кавычек
    while (quoteStack.length > 0) {
        const unmatched = quoteStack.pop();
        errors.push(`Незакрытая кавычка "${unmatched.quote}" в строке ${unmatched.row}, столбце ${unmatched.col}`);
    }
 
    if (errors.length === 0) {
        errorsList.innerHTML = '<li>Ошибок не найдено.</li>';
    } else {
        errors.forEach(error => {
            errorsList.innerHTML += `<li>${error}</li>`;
        });
    }
});