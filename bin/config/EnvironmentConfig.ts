export type EnvironmentConfig = {
    account: string,  // デプロイ先のアカウントID
    region: string  // デプロイ先のリージョン
}

export function getEnvironmentConfig(envType: string, regionName: string): EnvironmentConfig {
    let account: string = "";
    let region: string = "";

    // 環境によりアカウントIDを分岐
    switch (envType) {
        case 'verifyA':
        case 'verifyB':
        case 'dev':
        case 'stg':
            account = "024532196973";
            break;
        case 'prd':
            account = "xxxxxxxxxxx";
            break;
        default:
            throw new Error(
                `The accountId setting of "${envType}" does not exist.`
            )
    }


    // context値を元にリージョンを設定
    switch (regionName) {
        case 'tokyo':
            region = "ap-northeast-1";
            break;
        case 'osaka':
            region = "ap-northeast-3";
            break;
        default:
            throw new Error(
                `The region setting of "${regionName}" does not exist.`
            )
    }

    // アカウントIDおよびリージョンを返却
    return {
        account,
        region
    }

}