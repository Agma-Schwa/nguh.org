export function OpenTab(which: string) {
    for (let tab of document.getElementsByClassName('tab-content') as HTMLCollectionOf<HTMLElement>)
        tab.style.display = 'none'
    for (let button of document.getElementsByClassName('tab-button'))
        button.classList.remove('selected-button')

    let element = document.getElementById(which)
    let button = document.getElementById('button_' + which)
    if (!element || !button) return

    element.style.display = 'flex'
    button.classList.add('selected-button')
}