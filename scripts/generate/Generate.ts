import { GenerateUtil } from "./GenerateUtil"

const repo = "https://github.com/Adapter-Hub/Hub.git"
const repoTargetDir = "./AdapterHub"

const sourceFileDir = "./generated"
const sourceFileName = "AdapterHub.json"

const generateUtil: GenerateUtil = new GenerateUtil(repo, repoTargetDir, sourceFileDir)

function log(msg: string) {
    console.log("[generate] " + msg)
}

function logError(msg: string) {
    console.error("[generate] ERROR: " + msg)
}

function clean() {
    log("Deleting Local AdapterHub Repository")
    generateUtil.deleteLocalRepository()
}

async function main() {
    clean()

    log("Cloning AdapterHub Repository")
    const statusCodeCloneRepository: number = await generateUtil.cloneGitRepository()

    if (statusCodeCloneRepository === 0) {
        log("Successfully cloned with status code: " + statusCodeCloneRepository)

        log("Generating Sourcecode")
        const sourcecode: string = generateUtil.generateSourceCode()

        log("Creating Sourcefile")
        generateUtil.writeToSourceFile(sourceFileName, sourcecode)
    } else {
        logError("'git clone' returned status code: " + statusCodeCloneRepository)
    }
}

main().finally(clean)
