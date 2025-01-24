import {browser} from '$app/environment';

export function Persist<T extends string>(key: string, default_value: T): T {
    return (browser ? localStorage.getItem(key) as T | null : null) ?? default_value;
}