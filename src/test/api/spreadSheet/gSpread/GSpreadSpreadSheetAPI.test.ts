import { GSpreadSpreadSheetAPI } from "../../../../main/api/spreadSheet/gSpread/GSpreadSpreadSheetAPI"

test("link Matches Regex", () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    expect(
        gSpread.linkMatchesRegex(
            "https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit?usp=sharing"
        )
    ).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex(
            "https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit#gid=0"
        )
    ).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex("https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8")
    ).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex("https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/")
    ).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex(
            "https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/asd/sdasd/s/"
        )
    ).toBeTruthy()

    expect(
        gSpread.linkMatchesRegex("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit?usp=sharing")
    ).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit#gid=0")
    ).toBeTruthy()
    expect(gSpread.linkMatchesRegex("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8")).toBeTruthy()
    expect(gSpread.linkMatchesRegex("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/")).toBeTruthy()
    expect(
        gSpread.linkMatchesRegex("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/asd/sdasd/s/")
    ).toBeTruthy()
})

test("link does not match Regex", () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    expect(
        gSpread.linkMatchesRegex("dsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit?usp=sharing")
    ).toBeFalsy()
    expect(gSpread.linkMatchesRegex("https://docs.google.com/spreadsheets/d/")).toBeFalsy()
    expect(
        gSpread.linkMatchesRegex("https://docs.google.com/spreadsheets/W/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8")
    ).toBeFalsy()

    expect(gSpread.linkMatchesRegex("/spreadsheets/d/")).toBeFalsy()
    expect(gSpread.linkMatchesRegex("/spreadsheets/W/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8")).toBeFalsy()
})

test("link to SpreadSheet", () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    expect(
        gSpread.linkToSpreadSheet(
            "https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8/edit?usp=sharing"
        ).id
    ).toEqual("1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8")
    expect(
        gSpread.linkToSpreadSheet("https://docs.google.com/spreadsheets/d/1jjr0MKyPGHSLIBrcgn3ztRhNWO8/edit#gid=0").id
    ).toEqual("1jjr0MKyPGHSLIBrcgn3ztRhNWO8")
    expect(
        gSpread.linkToSpreadSheet("https://docs.google.com/spreadsheets/d/1jjr0MKZk6v5iWHon3ztRhNFBJbNTTWO8").id
    ).toEqual("1jjr0MKZk6v5iWHon3ztRhNFBJbNTTWO8")
    expect(
        gSpread.linkToSpreadSheet("https://docs.google.com/spreadsheets/d/1jjr0MyPGHSLIBrcgn3ztRhNFBJbNTTWO8/").id
    ).toEqual("1jjr0MyPGHSLIBrcgn3ztRhNFBJbNTTWO8")
    expect(
        gSpread.linkToSpreadSheet("https://docs.google.com/spreadsheets/d/1jjr0MKcgn3ztRhNFBJbNTTWO8/asd/sdasd/s/").id
    ).toEqual("1jjr0MKcgn3ztRhNFBJbNTTWO8")

    expect(
        gSpread.linkToSpreadSheet("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLtRhNFBJbNTTWO8/edit?usp=sharing").id
    ).toEqual("1jjr0MKZk6v5iWHoyPGHSLtRhNFBJbNTTWO8")
    expect(gSpread.linkToSpreadSheet("/spreadsheets/d/1jjr0MKZk6GHSLIBrcgn3ztRhNFBJbNTTWO8/edit#gid=0").id).toEqual(
        "1jjr0MKZk6GHSLIBrcgn3ztRhNFBJbNTTWO8"
    )
    expect(gSpread.linkToSpreadSheet("/spreadsheets/d/1jjr0MKZk6v5iWHoyPGHSLIBrcghNFBJbNTTWO8").id).toEqual(
        "1jjr0MKZk6v5iWHoyPGHSLIBrcghNFBJbNTTWO8"
    )
    expect(gSpread.linkToSpreadSheet("/spreadsheets/d/1/").id).toEqual("1")
    expect(gSpread.linkToSpreadSheet("/spreadsheets/d/1jjr0MKZk6v5iWHoyPWO8/asd/sdasd/s/").id).toEqual(
        "1jjr0MKZk6v5iWHoyPWO8"
    )
})

test("has Read Permissions For SpreadSheet", async () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    const apiCall = await gSpread.hasPermissionsForSpreadSheet({ id: "1jjr0MKZk6v5iWHoyPGHSLIBrcgn3ztRhNFBJbNTTWO8" })
    expect(apiCall.hasCorrectPermissions).toEqual(true)
    expect(apiCall.hasFoundSheet).toEqual(true)
})

test("has Read Permissions For SpreadSheet Failed Sheet Not Found", async () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    const apiCall = await gSpread.hasPermissionsForSpreadSheet({ id: "fCmwU" })
    expect(apiCall.hasCorrectPermissions).toEqual(false)
    expect(apiCall.hasFoundSheet).toEqual(false)
})

test("has Read Permissions For SpreadSheet Failed No Permissions", async () => {
    const gSpread: GSpreadSpreadSheetAPI = new GSpreadSpreadSheetAPI()

    const apiCall = await gSpread.hasPermissionsForSpreadSheet({ id: "1TGEoU9lhfZ-JhwSpseFatguEGg0OW-Z_QO5Tu0Okkqk" })
    expect(apiCall.hasCorrectPermissions).toEqual(false)
    expect(apiCall.hasFoundSheet).toEqual(true)
})
