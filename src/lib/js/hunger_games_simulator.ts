
/// ====================================================================== ///
///  Initialisation                                                        ///
/// ====================================================================== ///
/*
async function __Init() {
    try {
        const setup = localStorage.getItem(`setup`)
        if (setup) await Configuration.LoadCharacters(JSON.parse(setup))
        else Configuration.LoadDefaultCharacters()
    } catch (e) {
        Dialog.error(`Error loading saved characters: ${e}`)
    }
}

/// Load the config.
try {
    const config = localStorage.getItem(`config`)
    if (config) Configuration.Load(JSON.parse(config))
    else Configuration.LoadDefaultConfig();
} catch (e) {
    Dialog.error(`Error loading saved configuration: ${e}`)
}

if (document.readyState === 'complete') {
    __Init()
} else {
    window.addEventListener('DOMContentLoaded', __Init)
}

/// We need to be able to use the `Game` class outside this script.
/// @ts-ignore
window.Game = Game
*/
