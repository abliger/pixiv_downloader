import { expect, test, describe, } from "bun:test";
import util, { objMix } from "src/util";
console.log(console.log(new Date(1724216860)));

describe("util.ts objMix", () => {
    test("objMix type test", () => {
        let arr = [{ id: 1, name: "one" }, { id: 2, name: "two" }]
        let one = objMix(arr, [], "id")
        expect(typeof one).toEqual(typeof arr)
        type ObjMixParams<T> = typeof objMix<T> extends (arrOut: T[], oriArr: T[], key: infer P) => T[] ? P : never
        type getArrayObjTyp<T> = T extends Array<infer P> ? P : never
        let objMixParamsTest: ObjMixParams<getArrayObjTyp<typeof arr>> = "id"
        expect(objMixParamsTest).toBeTypeOf("string")
    })

    test("objMix test", () => {
        let arr = [{ id: 1, name: "one" }, { id: 2, name: "two" }]
        let one = objMix(arr, [], "id")
        expect(one).toBeArrayOfSize(2)
        expect(one).toEqual([{ id: 1, name: "one" }, { id: 2, name: "two" }])
        one = objMix(arr, [{ id: 1, name: "one" }, { id: 3, name: "three" }], "id")
        expect(one).toEqual([{ id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }])
        one = objMix(arr, [{ id: 4, name: "two" }, { id: 3, name: "three" }], "name")
        expect(one).toEqual([{ id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }])
    })

    test("objMix test", () => {
        let arr = [{ aggg: "324", name: "fdfff" }, { aggg: "324", name: "fdfff" }]
        let one = objMix(arr, [{ aggg: "234", name: "rrr" }], "aggg")
        expect(one).toBeArrayOfSize(3)
        expect(one).toEqual([{ aggg: "324", name: "fdfff" }, { aggg: "324", name: "fdfff" }, { aggg: "234", name: "rrr" }])
    })
})
describe("util.ts getUserImgAll", () => {
    test("getUserImgAll", async () => {
        let userId = "95799131"
        let info = await util.getUserImgAll(userId)
        // console.log(info);
        expect(info[0].length).toBeGreaterThan(300)
    }, 100000)

    test("getUserImgAllByPhone", async () => {
        let userId = "95799131"
        let info = await util.getUserImgAllByPhone(userId)
        // console.log(info);
        expect(info.length).toBeGreaterThan(300)
    }, 100000)

    test("getUserImgAllByPhone", async () => {
        let userId = "63335418"
        let info = await util.getUserImgAllByPhone(userId)
        // console.log(info);
        expect(info.length).toEqual(0)
    }, 100000)

})