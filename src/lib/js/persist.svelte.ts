import {browser} from '$app/environment';

/** Persist state in local storage. */
class PersistImpl<T> {
    readonly #key: string;
    value: T = $state<T>() as T;

    constructor(
        key: string,
        default_value: T,
        legacy_treat_invalid_json_as_string: Boolean = false,
    ) {
        this.#key = key;

        // Read the value from local storage if it exists.
        if (browser) {
            const existing = localStorage.getItem(key);
            if (existing) try {
                this.value = JSON.parse(existing);
            } catch (e) {
                console.error("Failed to load persistent data:", e)

                // If this is a value that we used to store as a string, just treat
                // it as one. We can detect that by checking whether the default value
                // is a string.
                if (
                    legacy_treat_invalid_json_as_string &&
                    default_value !== undefined &&
                    typeof default_value === 'string'
                ) {
                    console.log('Interpreting value as string:', existing)
                    default_value = existing as T
                }
            }
        }

        // Otherwise, if the default value is not undefined, set it as the value.
        if (this.value === undefined && default_value !== undefined)
            this.value = default_value;

        // Use an effect to save the value rather than doing that in the setter
        // since the latter would not handle deeply reactive state properly.
        $effect.root(() => {
            $effect(() => {
                localStorage.setItem(this.#key, JSON.stringify(this.value))
            })
        })
    }

    clear() {
        localStorage.removeItem(this.#key)
    }
}

export function Persist<T>(
    key: string,
    default_value: T,
    legacy_treat_invalid_json_as_string: Boolean = false,
): { value: T  } {
    return new PersistImpl(key, default_value, legacy_treat_invalid_json_as_string);
}