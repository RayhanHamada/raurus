type ClassNameValue = false | null | string | undefined;

export const cn = (...classNames: readonly ClassNameValue[]): string =>
    classNames.filter(Boolean).join(" ");
