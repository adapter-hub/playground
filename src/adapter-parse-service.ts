import JSZip, { JSZipObject } from "jszip"
import { AdapterConfig } from "./components/adapterhub-adapter-config"

export class AdapterParseService {
    private unzipZipBuffer(data: ArrayBuffer): Promise<JSZip> {
        return JSZip.loadAsync(data)
    }

    private getAdapterConfigFile(zip: JSZip): JSZipObject {
        const jsonFiles = zip.filter((relativePath: string, file: JSZip.JSZipObject) => {
            return relativePath.endsWith("adapter_config.json")
        })

        if (jsonFiles.length == 0) {
            throw new Error("zip does not contain a adapter_config.json")
        }

        return jsonFiles[0]
    }

    private async getAdapterConfigJson(configFile: JSZipObject): Promise<any> {
        const content = await configFile.async("text")
        return JSON.parse(content)
    }

    private async convertZipToAdapter(zip: JSZip): Promise<ArrayBuffer> {
        const configName = this.getAdapterConfigFile(zip).name
        const adapterLocation = configName.substr(0, configName.length - "adapter_config.json".length)

        const files = zip.filter((relativePath: string, file: JSZip.JSZipObject) => {
            return relativePath.startsWith(adapterLocation)
        })

        const adapterZip = new JSZip()

        files.forEach((file) => {
            const filePaths = file.name.split("/")
            const fileName = filePaths[filePaths.length - 1]

            adapterZip.file(fileName, file.async("arraybuffer"))
        })

        return await adapterZip.generateAsync({ type: "arraybuffer" })
    }

    public async getAdapterConfig(data: ArrayBuffer): Promise<AdapterConfig> {
        const zip = await this.unzipZipBuffer(data)
        const configFile = await this.getAdapterConfigFile(zip)

        const adapterConfigJson = await this.getAdapterConfigJson(configFile)

        if (!adapterConfigJson.name || !adapterConfigJson.model_class || !adapterConfigJson.model_name) {
            throw new Error("adapter_config.json is corrupted")
        }

        const arrayBuffer = await this.convertZipToAdapter(zip)

        return {
            data: new Blob([new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength)]),
            adapterName: adapterConfigJson.name,
            modelClass: adapterConfigJson.model_class,
            modelName: adapterConfigJson.model_name,
        }
    }
}
