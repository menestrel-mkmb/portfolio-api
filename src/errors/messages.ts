export const stringMessage = (propName: string): string => {
    return `${propName} has to be a string`;
}

export const numberMessage = (propName: string): string => {
    return `${propName} has to be a number`;
}

export const booleanMessage = (propName: string): string => {
    return `${propName} has to be a boolean`;
}

export const urlMessage = (propName: string): string => {
    return `${propName} has to be a valid url`;
}

export const uuidMessage = (propName: string): string => {
    return `${propName} has to be a valid uuid`;
}

export const minMessage = (propName: string, min: number): string => {
    return `${propName} needs at least ${min} characters`;
}

export const maxMessage = (propName: string, max: number): string => {
    return `${propName} has to be at most ${max} characters`;
}

export const gteNumberMessage = (propName: string, min: number): string => {
    return `${propName} has to be greater than or equal to ${min}`;
}

export const positiveNumberMessage = (propName: string): string => {
    return `${propName} has to be a positive number`;
}

export const integerMessage = (propName: string): string => {
    return `${propName} has to be an integer`;
}

export const finiteNumberMessage = (propName: string): string => {
    return `${propName} has to be a finite number`;
}

export const safeNumberMessage = (propName: string): string => {
    return `${propName} has to be a safe number`;
}

export const ISODateMessage = (propName: string): string => {
    return `${propName} has to be a ISO date on YYYY-MM-DDTHH:MM:SSZ`;
}