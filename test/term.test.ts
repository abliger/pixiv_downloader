import term from "src/term";
import { expect, test, describe, afterAll } from "bun:test";

import readline from 'node:readline';
import { stdin as input, stdout as output, stderr } from 'node:process';
import { peek } from "bun";
describe("term.ts test", () => {
    test("spinner", async () => {
        let term = require("../src/term").default;
        let ins = term.getIns()
        let txt = "测试 spinner"
        term.spinner(txt)
        expect(ins.frame()).toContain(txt)
        expect(ins.frame().length).toBeGreaterThan(txt.length)
    })

    test("inputBool input y", async () => {
        let res = term.inputBool("输入")
        process.stdin.emit("keypress", "y", { name: 'y' })
        expect(await res).toBeTrue()
    })
    test("inputBool input not y \r", async () => {
        let res = term.inputBool("输入")
        process.stdin.emit("keypress", "b", { name: 'b' })
        expect(peek.status(res)).toEqual("pending")
        process.stdin.emit("keypress", "n", { name: 'n' })
        expect(peek.status(res)).toEqual("pending")
        expect(await res).toBeFalse()
        expect(peek.status(res)).toEqual("fulfilled")
    })
    test("inputBool input \r", async () => {
        const rl = readline.createInterface({ input, output });
        let res = term.inputBool("输入")
        process.stdin.emit("keypress", "\r", { name: 'return' })
        expect(await res).toBeTrue()
    })
    test("spinnerSuffix ", async () => {
        term.spinnerSuffix("test")
        term.spinnerSuffix("test1")
    })
})

afterAll(() => {
    term.closeSpinner()
})
// let a = term.spinnerEq("spinnerSuffix")
// for (let index = 0; index < 100; index++) {
//     a(100)
//     await new Promise((r) => {
//         setTimeout(() => {
//             r(0)
//         }, 100);
//     })
// }