import { GSpreadAPI } from "../../../main/api/gSpread/GSpreadAPI"

test("get SpreadSheet as CSV", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = await gSpread.getSpreadSheetAsCSV({ id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" })
    expect(apiCall).toEqual([
        ["get", "csv", ""],
        ["test", "", "bp"],
    ])
})

test("get SpreadSheet as CSV Failed Sheet not found", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = async () => {
        await gSpread.getSpreadSheetAsCSV({ id: "fCmwU" })
    }
    await expect(apiCall).rejects.toThrow("Request failed with status code 404")
})

test("get SpreadSheet as CSV Failed no Permission", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = async () => {
        await gSpread.getSpreadSheetAsCSV({ id: "1TGEoU9lhfZ-JhwSpseFatguEGg0OW-Z_QO5Tu0Okkqk" })
    }
    await expect(apiCall).rejects.toThrow("did not receive csv")
})

test("get SpreadSheet Range as CSV", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = await gSpread.getSpreadSheetAsCSV({ id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" }, "A:A")
    expect(apiCall).toEqual([["get"], ["test"]])
})

test("get SpreadSheet Range as CSV Failed out of bounds", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = await gSpread.getSpreadSheetAsCSV({ id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" }, "E:E")
    expect(apiCall).toEqual([[]])
})

test("get SpreadSheet B/A ratio", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCallB = await gSpread.getColumnCountRatioToFirstColumn(
        { id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" },
        1
    )
    expect(apiCallB).toEqual(0)

    const apiCallC = await gSpread.getColumnCountRatioToFirstColumn(
        { id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" },
        2
    )
    expect(apiCallC).toEqual(1)
})

test("get SpreadSheet column count ration, column out of bounds", async () => {
    const gSpread: GSpreadAPI = new GSpreadAPI()

    const apiCall = await gSpread.getColumnCountRatioToFirstColumn(
        { id: "1PTjyPskg4IPNoHH36P_mED_993mTB4joKD1JfPfCmwU" },
        3
    )
    expect(apiCall).toEqual(0)
})
