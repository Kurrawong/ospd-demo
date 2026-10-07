// Display terminology only; resource IRIs and API routes remain unchanged.
export const registerLabel = (text: string) => text.replace(/\bcatalog(?:ue)?(s)?\b/gi, (word, plural) => {
    const label = plural ? 'registers' : 'register';
    return word[0] === word[0]?.toUpperCase() ? label[0]!.toUpperCase() + label.slice(1) : label;
});
