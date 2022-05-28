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
            break
        case 'prd':
            account = "xxxxxxxxxxx";
            break;
    }

    // アカウントIDが未設定の場合エラー
    if (account == undefined) {
        throw new Error(
            'Context value env is invalid (use "verify*" or "dev" or "stg" or "prd")'
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
    }

    // リージョンが未設定の場合はエラー
    if (region == undefined) {
        throw new Error(
            'Context value region is invalid (use "tokyo" or "osaka")'
        )
    }

    // アカウントIDおよびリージョンを返却
    return {
        account,
        region
    }

}