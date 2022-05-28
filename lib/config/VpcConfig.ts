import * as cdk from 'aws-cdk-lib';

export type VpcConfig = {
    networkAddress: string,  // VPCおよびサブネットで使用するネットワークアドレスを指定。ネットワークアドレスのcidrは16としている。
    removalpolicy: cdk.RemovalPolicy,  // スタック削除にVPCフローログのバケットを保持するかの設定
    autoDeleteObjects: boolean  // スタック削除にS3バケット内のVPCフローログを削除するかの設定
}

export function getVpcConfig(env: string): VpcConfig {
    switch (env) {
        case 'dev':
            return {
                networkAddress: '10.0',
                removalpolicy: cdk.RemovalPolicy.RETAIN,
                autoDeleteObjects: false
            }
        case 'stg':
            return {
                networkAddress: '10.1',
                removalpolicy: cdk.RemovalPolicy.DESTROY,
                autoDeleteObjects: true
            }
        case 'prd':
            return {
                networkAddress: '10.2',
                removalpolicy: cdk.RemovalPolicy.RETAIN,
                autoDeleteObjects: false,
            }
        default:
            throw new Error(
                `The setting of "${env}" does not exist.`
            )
    }
}