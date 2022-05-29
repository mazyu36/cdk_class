import * as cdk from 'aws-cdk-lib';

export type VpcConfig = {
    networkAddress: string,  // VPCおよびサブネットで使用するネットワークアドレスを指定。ネットワークアドレスのcidrは16としている。
    removalpolicy: cdk.RemovalPolicy,  // スタック削除にVPCフローログのバケットを保持するかの設定
    autoDeleteObjects: boolean,  // スタック削除にS3バケット内のVPCフローログを削除するかの設定
    primaryAzName: string,
    secondaryAzName: string
}

export function getVpcConfig(envType: string, regionName: string): VpcConfig {
    let primaryAzName: string = "";
    let secondaryAzName: string = "";

    switch (regionName) {
        case 'tokyo':
            {
                primaryAzName = 'ap-northeast-1a';
                secondaryAzName = 'ap-northeast-1c';
                break;
            }
        case 'osaka':
            {
                primaryAzName = 'ap-northeast-3a';
                secondaryAzName = 'ap-northeast-3c';
                break;
            }
        default:
            throw new Error(
                `The AZs setting of "${regionName}" does not exist.`
            )
    }

    switch (envType) {
        case 'dev':
            return {
                networkAddress: '10.0',
                removalpolicy: cdk.RemovalPolicy.RETAIN,
                autoDeleteObjects: false,
                primaryAzName: primaryAzName,
                secondaryAzName: secondaryAzName
            }
        case 'stg':
            return {
                networkAddress: '10.1',
                removalpolicy: cdk.RemovalPolicy.DESTROY,
                autoDeleteObjects: true,
                primaryAzName: primaryAzName,
                secondaryAzName: secondaryAzName
            }
        case 'prd':
            return {
                networkAddress: '10.2',
                removalpolicy: cdk.RemovalPolicy.RETAIN,
                autoDeleteObjects: false,
                primaryAzName: primaryAzName,
                secondaryAzName: secondaryAzName
            }
        default:
            throw new Error(
                `The vpc setting of "${envType}" does not exist.`
            )
    }
}