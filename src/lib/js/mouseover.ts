type callback = (() => void)

export class MouseoverContext {
    private elements: HTMLElement[]
    private mouseenter: callback[]
    private mouseleave: callback[]
    private toggleon: callback[]
    private toggleoff: callback[]
    private toggled: boolean
    private entered: boolean
    private toggle_click: boolean

    private B_PerformClickOnWindow: (e: Event) => void
    private B_PerformClickOnElement: (e: Event) => void
    private B_Enter: callback
    private B_Leave: callback

    constructor(media_query: MediaQueryList | null, ...elements: (HTMLElement | null)[]) {
        let _this = this

        this.elements = elements.filter(e => e) as HTMLElement[]
        this.mouseenter = []
        this.mouseleave = []
        this.toggleon = []
        this.toggleoff = []
        this.toggled = false
        this.entered = false
        this.toggle_click = false

        this.B_PerformClickOnWindow = (e: Event) => MouseoverContext.PerformClickOnWindow(_this, e)
        this.B_PerformClickOnElement = (e: Event) => MouseoverContext.PerformClickOnElement(_this, e)
        this.B_Enter = () => MouseoverContext.enter(_this)
        this.B_Leave = () => MouseoverContext.leave(_this)

        if (media_query) {
            media_query.addEventListener('change', (e) => MouseoverContext.DoMouseoverSwitch(_this, e))

            function setup_mq() { MouseoverContext.DoMouseoverSwitch(_this, media_query!) }
            if (document.readyState !== "loading") setup_mq()
            else document.addEventListener('DOMContentLoaded', setup_mq)
        } else {
            function setup() { _this.toggleon.forEach(fun => fun()) }
            if (document.readyState !== "loading") setup()
            else document.addEventListener('DOMContentLoaded', setup)

            if (_this.toggle_click) {
                window.addEventListener('click', _this.B_PerformClickOnWindow)
                _this.elements.forEach(el => el.addEventListener('click', _this.B_PerformClickOnElement))
            }
        }
    }

    static leave(_this: MouseoverContext, override = false) {
        if ((!_this.toggled && _this.entered) || override) _this.mouseleave.forEach(fun => fun())
        _this.entered = false
    }

    static enter(_this: MouseoverContext, override = false) {
        if ((!_this.toggled && !_this.entered) || override) _this.mouseenter.forEach(fun => fun())
        _this.entered = true
    }

    static PerformClickOnElement(_this: MouseoverContext, e: Event) {
        if (_this.toggled) {
            MouseoverContext.leave(_this, true)
            _this.toggled = false
        } else {
            MouseoverContext.enter(_this, true)
            _this.toggled = true
        }
        e.stopPropagation()
    }

    static PerformClickOnWindow(_this: MouseoverContext, e: Event) {
        let outside_element = true
        for (const el of _this.elements) {
            if (e.target === el) {
                outside_element = false
                break
            }
        }

        if (outside_element && _this.toggled) {
            MouseoverContext.leave(_this, true)
            _this.toggled = false
            _this.entered = false
        }
    }

    static DoMouseoverSwitch(_this: MouseoverContext, e: MediaQueryList | MediaQueryListEvent) {
        if (e.matches) {
            _this.elements.forEach(el => el.addEventListener('mouseenter', _this.B_Enter))
            _this.elements.forEach(el => el.addEventListener('mouseleave', _this.B_Leave))

            if (_this.toggle_click) {
                window.addEventListener('click', _this.B_PerformClickOnWindow)
                _this.elements.forEach(el => el.addEventListener('click', _this.B_PerformClickOnElement))
            }

            console.log("FOOBAR", _this.toggleon)
            _this.toggleon.forEach(fun => fun())
        } else {
            _this.elements.forEach(el => el.removeEventListener('mouseenter', _this.B_Enter))
            _this.elements.forEach(el => el.removeEventListener('mouseleave', _this.B_Leave))

            if (_this.toggle_click) {
                window.removeEventListener('click', _this.B_PerformClickOnWindow)
                _this.elements.forEach(el => el.removeEventListener('click', _this.B_PerformClickOnElement))
            }

            _this.toggleoff.forEach(fun => fun())
        }
    }

    onenter(f: callback): MouseoverContext {
        this.mouseenter.push(f);
        return this
    }

    onleave(f: callback): MouseoverContext {
        this.mouseleave.push(f);
        return this
    }

    ontoggleon(function_resolvable: string | callback): MouseoverContext {
        if (typeof function_resolvable === 'string') {
            if (function_resolvable === 'leave') this.toggleon.push(...this.mouseleave)
            else if (function_resolvable === 'enter') this.toggleon.push(...this.mouseenter)
        } else this.toggleon.push(function_resolvable)
        return this
    }

    ontoggleoff(function_resolvable: string | callback): MouseoverContext {
        if (typeof function_resolvable === 'string') {
            if (function_resolvable === 'leave') this.toggleoff.push(...this.mouseleave)
            else if (function_resolvable === 'enter') this.toggleoff.push(...this.mouseenter)
        } else this.toggleoff.push(function_resolvable)
        return this
    }

    toggleonclick(bool: boolean): MouseoverContext {
        this.toggle_click = bool
        return this
    }
}