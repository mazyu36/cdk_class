#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NonDisposableStack } from '../lib/stacks/NonDisposableStack';
import { EnvironmentConfig, getEnvironmentConfig } from './config/EnvironmentConfig';
import { DisposableStack } from '../lib/stacks/DisposableStack';

const app = new cdk.App();

// ----------------------- contextの値取得、および必要なパラメータの取得・生成 ------------------------------
// contextから環境の情報を取得。未設定の場合はエラーとする。
const envType = app.node.tryGetContext('env');
const regionName = app.node.tryGetContext('region')
if (envType == undefined || regionName == undefined)
    throw new Error(`Please specify environment and region with context option. ex) cdk deploy -c env=dev -c region=tokyo`);

// 環境に関する設定値を取得する
const environmentConfig: EnvironmentConfig = getEnvironmentConfig(envType, regionName);

// システム名を指定し、リソースに付与するprefixを作成
const systemName = "test";

// prefixに使用するリージョン名を作成
let regionPrefix = "";

if (environmentConfig.region == 'ap-northeast-1') {
    regionPrefix = 'apne1'
}
else if (environmentConfig.region == 'ap-northeast-3') {
    regionPrefix = 'apne3'
} else {
    throw new Error(`The regionPrefix setting of "${environmentConfig.region}" does not exist.`);
}

// prefixを作成
const prefix = `${systemName}-${envType}-${regionPrefix}`;


// ----------------------- リソースを作成 ------------------------------
// NonDisposableStackを作成
const nonDisposableStack = new NonDisposableStack(app, 'NonDisposableStack', {
    stackName: `${prefix}-NonDisposableStack`,
    env: environmentConfig,
    prefix: prefix
})

// DisposableStackを作成
const disposableStack = new DisposableStack(app, 'DisposableStack', {
    stackName: `${prefix}-DisposableStack`,
    env: environmentConfig,
    prefix: prefix,
    nonDisposableStack: nonDisposableStack
})


// ----------------------- 全リソースに共通のタグの付与 ------------------------------
// システム名を付与
const systemTagName = 'System';
cdk.Tags.of(app).add(systemTagName, systemName);

// リージョンを付与
const regionTagName = 'Region';
cdk.Tags.of(app).add(regionTagName, environmentConfig.region,{
    // グローバルリソースにはリージョンのタグを付与しない(IAM等)
    excludeResourceTypes: ['AWS::IAM::Role'],
});

// 環境名を付与
const envTagName = 'Environment';
cdk.Tags.of(app).add(envTagName, envType);

