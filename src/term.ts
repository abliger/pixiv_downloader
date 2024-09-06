import chalk from "chalk";
import ora, { type Ora } from "ora";

class termLine {
    constructor() {
        this.#spinnerIns = ora().start();
    }
    #spinnerIns: Ora
    spinner(txt: string) {
        if (!this.#spinnerIns.isSpinning) {
            this.#spinnerIns.text = ''
            this.#spinnerIns.start()
        }
        this.#spinnerIns.text = txt
    }
    write(txt: string) {
        this.#spinnerIns.text = chalk.gray(txt)
    }
    writeLine(txt: string) {
        this.#spinnerIns.text += "\n" + txt
    }
    closeSpinner(clear: boolean = false, type: 'info' | 'succeed' | 'fail' | 'warn' = 'succeed') {
        this.#spinnerIns = clear ? this.#spinnerIns.clear() : this.#spinnerIns[type]()
    }
}
export default new termLine()