import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import readline, { type Key } from 'node:readline'
import { stdin as input, stdout as output } from 'node:process'
class termLine {
  constructor() {
    this.#spinnerIns = ora().start()
  }
  #spinnerIns: Ora
  getIns() {
    return this.#spinnerIns
  }
  async inputBool(txt: string): Promise<boolean> {
    this.#spinnerIns.text = txt + chalk.grey('Y or N')
    const rl = readline.createInterface({ input, output })
    return new Promise((resolve) => {
      input.on('keypress', (c: string, k: Key) => {
        this.#spinnerIns.text = rl.line.length > 0 ? txt + ' ' + rl.line : txt + chalk.grey('Y or N')
        const key = c.toLocaleLowerCase()
        if (key === 'n' || key === 'y' || k.name === 'return') {
          input.removeListener('keypress', () => {
          })
          this.#spinnerIns.text = ''
          resolve(key === 'n' ? false : true)
        }
      })
    })
  }
  // async inputTxt(txt: string, arr: string[]) {
  //     this.#spinnerIns.text = txt
  //     const rl = readline.createInterface({ input, output });
  //     return new Promise((resolve) => {
  //         process.stdin.on('keypress', (c: string, k) => {
  //             if (c.match(/\w+/)) {
  //                 console.log(rl.line);

  //                 arr.filter(val => val.startsWith(rl.line)).forEach(v => {
  //                     this.#spinnerIns.text += "\n" + v
  //                 })
  //             }
  //         })
  //     })
  // }
  spinner(txt: string) {
    if (!this.#spinnerIns.isSpinning) {
      this.#spinnerIns.text = ''
      this.#spinnerIns.start()
    }
    this.#spinnerIns.text = txt
  }
  spinnerSuffix(txt: string) {
    this.#spinnerIns.suffixText = '\n' + txt
  }
  spinnerPrefix(txt: string) {
    this.#spinnerIns.prefixText = txt + '\n'
  }
  write(txt: string) {
    this.#spinnerIns.text = chalk.gray(txt)
  }
  writeLine(txt: string) {
    this.#spinnerIns.text += '\n' + txt
  }
  closeSpinner(clear: boolean = false, type: 'info' | 'succeed' | 'fail' | 'warn' = 'succeed') {
    this.#spinnerIns = clear ? this.#spinnerIns.clear() : this.#spinnerIns[type]()
  }
  spinnerEq(name: 'spinnerSuffix' | 'spinner' | 'spinnerPrefix') {
    let current = 0
    const totalLength = 20
    let eqLength = 0
    return (imgLength: number) => {
      current += 1
      this[name](`[${Array(eqLength).fill('=').join('') + Array(totalLength - eqLength).fill(' ').join('')}] ${current}/${imgLength}`)
      eqLength = Math.floor(current / (imgLength / totalLength)) + 1
    }
  }
}
export default new termLine()